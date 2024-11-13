import * as admin from "firebase-admin";
import {firestore} from "firebase-admin";
import {CHECKOUT_SESSION_CONVERTER, CheckoutSession} from "./session";
import {FirestoreLiqPayError} from "./errors";
import {utilReplaceTokensInString} from "./utils";
import DocumentSnapshot = firestore.DocumentSnapshot;

/**
 * Default timeout for waiting for a payment to be created.
 */
export const DEFAULT_PAYMENTS_TIMEOUT_IN_MILLISECONDS = 30 * 1000;

/**
 * Default Firestore collection name for invoices.
 */
export const DEFAULT_INVOICES_COLLECTION = "invoices";

/**
 * Default Firestore collection name for checkout sessions.
 */
export const DEFAULT_SESSIONS_COLLECTION = "checkout-sessions";

/**
 * Options for the PaymentsClient.
 */
export interface PaymentsClientOptions {
  /**
   * The Firestore collection name for invoices.
   */
  invoicesCollection: string;

  /**
   * The Firestore collection name for checkout sessions.
   */
  sessionsCollection: string;

  /**
   * The timeout in milliseconds for waiting for a `CheckoutSession` with
   * filled `paymentPageURL` field to be created.
   */
  timeoutInMilliseconds?: number;
}

/**
 * Options for waiting for a checkout session method.
 */
export interface WaitForCheckoutSessionOptions {
  /**
   * The timeout in milliseconds for waiting for a `CheckoutSession` with
   * filled `paymentPageURL` field to be created.
   */
  timeoutInMilliseconds?: number;
}

/**
 * A client for interacting with the Firestore LiqPay Payments extension.
 */
export class PaymentsClient {
  /**
   * Creates a new instance of the PaymentsClient.
   * @param options - The options for the client.
   */
  constructor(readonly options: PaymentsClientOptions) {}

  /**
   * Places an invoice in the Firestore LiqPay Payments extension. This method
   * will create a new invoice document in the `options.invoicesCollection`
   * Firestore collection which will trigger a Checkout request to LiqPay.
   *
   * This is a facade method for the `handleInvoicePlaced` method of the
   * extension.
   *
   * @param invoice The invoice to place. It should be a plain object that is
   * serializable to Firestore. Its structure could be anything, the extension
   * will translate it to a LiqPay Checkout request using the rules defined in
   * the `INVOICE_TO_CHECKOUT_REQUEST_JSONATA` extension's parameter.
   *
   * @returns A promise that resolves when the id of the invoice is created.
   */
  async placeInvoice(
    invoice: Record<string, any>,
  ): Promise<string> {
    const db = admin.firestore();

    try {
      if (invoice.hasOwnProperty("id")) {
        await db.collection(this.options.invoicesCollection).doc(invoice.id).set(invoice);
        return invoice.id;
      } else {
        const ref = await db.collection(this.options.invoicesCollection).add(invoice);
        return ref.id;
      }
    } catch (err) {
      throw new FirestoreLiqPayError(
        "internal",
        "Error placing invoice in Firestore",
        err,
      );
    }
  }

  /**
   * Waits for a `CheckoutSession` document to be created in Firestore with a
   * `paymentPageURL` field. This method will listen for changes to the
   * `CheckoutSession` document in Firestore and resolve when the `paymentPageURL`
   * or an error is set.
   * @param invoiceId The ID of the invoice.
   * @param tokens Optional tokens to replace in the collection path.
   * @param options Options for waiting for the checkout session.
   *
   * @returns A promise that resolves with a `CheckoutSession` object.
   * The object will contain the `paymentPageURL` field if the checkout request
   * was successful, or an `error` object if the request failed.
   */
  async waitForCheckoutSession(
    invoiceId: string,
    tokens?: Record<string, any>,
    options?: WaitForCheckoutSessionOptions,
  ): Promise<CheckoutSession> {
    const db = admin.firestore();
    const path = this.configResolveCheckoutSessionDocumentPath(tokens ?? {}, invoiceId);
    const ref = db.doc(path);
    let cancel: () => void = () => {};
    try {
      return await new Promise<CheckoutSession>((resolve, reject) => {
        const timeout: ReturnType<typeof setTimeout> = setTimeout(() => {
          reject(
            new FirestoreLiqPayError(
              "timeout",
              "Timeout waiting for checkout session to be created",
            ),
          );
        }, this.getTimeoutInMilliseconds(options?.timeoutInMilliseconds));
        cancel = ref.withConverter(CHECKOUT_SESSION_CONVERTER).onSnapshot(
          (snap: DocumentSnapshot<CheckoutSession>) => {
            const session: CheckoutSession | undefined = snap.data();
            if (session && session.paymentPageURL) {
              clearTimeout(timeout);
              resolve(session);
            } else if (session && session.error) {
              clearTimeout(timeout);
              reject(
                new FirestoreLiqPayError(
                  "internal",
                  `Error placing invoice in LiqPay. ${session.error.code}: ${session.error.message}`,
                  session.error,
                ),
              );
            }
          },
          (err: Error) => {
            clearTimeout(timeout);
            reject(
              new FirestoreLiqPayError(
                "internal",
                "Error waiting for checkout session to be created",
                err,
              ),
            );
          },
        );
      });
    } finally {
      cancel();
    }
  }

  /**
   * Fetches a `CheckoutSession` document from Firestore.
   * @param invoiceId The ID of the invoice.
   * @param tokens Optional tokens to replace in the collection path.
   */
  async fetchCheckoutSession(
    invoiceId: string,
    tokens?: Record<string, any>,
  ): Promise<CheckoutSession> {
    const db = admin.firestore();
    const path = this.configResolveCheckoutSessionDocumentPath(tokens ?? {}, invoiceId);
    const snp = await db.doc(path).get();
    if (!snp.exists) {
      throw new FirestoreLiqPayError(
        "not-found",
        `Checkout session document not found: ${path}`,
      );
    }
    return snp.data() as CheckoutSession;
  }

  /**
   * Cancels a `CheckoutSession` document in Firestore.
   * @param invoiceId The ID of the invoice.
   * @param tokens Optional tokens to replace in the collection path.
   */
  async cancelCheckoutSession(
    invoiceId: string,
    tokens?: Record<string, any>,
  ): Promise<void> {
    const db = admin.firestore();
    const path = this.configResolveCheckoutSessionDocumentPath(tokens ?? {}, invoiceId);
    await db.doc(path).update({
      status: "cancelled",
    });
  }

  /**
   * Finds `CheckoutSession` documents in Firestore with a specific status.
   * @param status The status to filter by.
   * @param tokens Optional tokens to replace in the collection path.
   */
  async findCheckoutSessionsWithStatus(
    status: "pending" | "cancelled" | "success" | "failure",
    tokens?: Record<string, any>,
  ): Promise<CheckoutSession[]> {
    const db = admin.firestore();
    const collection = utilReplaceTokensInString(this.options.sessionsCollection, tokens ?? {});
    const query = db.collection(collection)
      .where("status", "==", status)
      .withConverter(CHECKOUT_SESSION_CONVERTER);
    const snp = await query.get();
    return snp.docs.map((doc) => doc.data());
  }

  /**
   * Finds `CheckoutSession` documents in Firestore with a status of "pending".
   * @param tokens Optional tokens to replace in the collection path.
   */
  async findPendingCheckoutSessions(
    tokens?: Record<string, any>,
  ): Promise<CheckoutSession[]> {
    return this.findCheckoutSessionsWithStatus("pending", tokens);
  }

  /**
   * Returns the timeout in milliseconds for waiting for a payment to be created.
   * @param timeout
   * @private
   */
  private getTimeoutInMilliseconds(timeout: number | undefined): number {
    if (typeof timeout === "undefined") {
      return (
        this.options.timeoutInMilliseconds ??
        DEFAULT_PAYMENTS_TIMEOUT_IN_MILLISECONDS
      );
    }
    if (Math.sign(timeout) !== 1) {
      throw new FirestoreLiqPayError(
        "invalid-argument",
        "timeout must be a positive number",
      );
    }
    return timeout;
  }

  private configResolveCheckoutSessionDocumentPath(
    invoice: Record<string, any>,
    invoiceId: string,
  ): string {
    const collection = utilReplaceTokensInString(this.options.sessionsCollection, {
      ...Object.fromEntries(Object.entries(invoice).map(([key, value]) => [key, value?.toString()])),
    });
    return `${collection}/${invoiceId}`;
  }
}
