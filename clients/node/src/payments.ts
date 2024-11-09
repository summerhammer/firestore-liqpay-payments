import * as admin from "firebase-admin";
import { firestore } from "firebase-admin";
import { CHECKOUT_SESSION_CONVERTER, CheckoutSession } from "./session";
import { FirestoreLiqPayError } from "./errors";
import DocumentReference = firestore.DocumentReference;
import DocumentSnapshot = firestore.DocumentSnapshot;
import {utilReplaceTokensInString} from "./utils";

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
 * Options for placing an invoice method.
 */
export interface PlaceInvoiceOptions {
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
   * @param options Options for placing the invoice.
   *
   * @returns A promise that resolves with a `CheckoutSession` object.
   * The object will contain the `paymentPageURL` field if the checkout request
   * was successful, or an `error` object if the request failed.
   */
  async placeInvoice(
    invoice: Record<any, any>,
    options?: PlaceInvoiceOptions,
  ): Promise<CheckoutSession> {
    const db = admin.firestore();

    let ref: DocumentReference;
    try {
      ref = await db.collection(this.options.invoicesCollection).add(invoice);
    } catch (err) {
      throw new FirestoreLiqPayError(
        "internal",
        "Error placing invoice in Firestore",
        err,
      );
    }

    return this.waitForCheckoutSessionWithPaymentPageURL(
      db.doc(this.configResolveCheckoutSessionDocumentPath(invoice, ref.id)),
      this.getTimeoutInMilliseconds(options?.timeoutInMilliseconds),
    );
  }

  /**
   * Waits for a `CheckoutSession` document to be created in Firestore with a
   * @param ref The reference to the `CheckoutSession` document.
   * @param timeoutInMilliseconds The timeout in milliseconds to wait for the
   * `CheckoutSession` document to be created.
   * @private
   */
  private async waitForCheckoutSessionWithPaymentPageURL(
    ref: DocumentReference,
    timeoutInMilliseconds: number,
  ): Promise<CheckoutSession> {
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
        }, timeoutInMilliseconds);
        cancel = ref.withConverter(CHECKOUT_SESSION_CONVERTER).onSnapshot(
          (snap: DocumentSnapshot<CheckoutSession>) => {
            const session: CheckoutSession | undefined = snap.data();
            if (session && session.paymentPageURL) {
              clearTimeout(timeout);
              resolve(session);
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
    invoice: Record<any, any>,
    invoiceId: string,
  ): string {
    const collection = utilReplaceTokensInString(this.options.sessionsCollection, {
      ...Object.fromEntries(Object.entries(invoice).map(([key, value]) => [key, value?.toString()])),
    });
    return `${collection}/${invoiceId}`;
  }
}
