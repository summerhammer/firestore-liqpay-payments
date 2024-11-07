import {
  DEFAULT_INVOICES_COLLECTION,
  DEFAULT_SESSIONS_COLLECTION,
  PaymentsClient,
  PaymentsClientOptions,
} from "./payments";

/**
 * Options for the Firestore LiqPay Client.
 */
export interface FirestoreLiqPayClientOptions {
  /**
   * Options for the PaymentsClient.
   */
  payments?: PaymentsClientOptions;

  /**
   * The timeout in milliseconds that is used by all the methods of the client
   * if more specific timeout is not provided.
   */
  timeoutInMilliseconds?: number;
}

/**
 * A facade client for interacting with the Firestore LiqPay Payments extension.
 */
export class FirestoreLiqPayClient {
  /**
   * Creates a new instance of the Firestore LiqPay client with default options.
   */
  static createDefault(): FirestoreLiqPayClient {
    return new FirestoreLiqPayClient();
  }

  /**
   * Creates a new instance of the Firestore LiqPay client with the provided
   * options.
   *
   * @param options - The options for the client.
   */
  constructor(private readonly options?: FirestoreLiqPayClientOptions) {}

  private _payments: PaymentsClient | null = null;
  /**
   * A client for interacting with the Firestore LiqPay Payments extension.
   */
  get payments(): PaymentsClient {
    if (!this._payments) {
      this._payments = new PaymentsClient({
        invoicesCollection:
          this.options?.payments?.invoicesCollection ??
          DEFAULT_INVOICES_COLLECTION,
        sessionsCollection:
          this.options?.payments?.sessionsCollection ??
          DEFAULT_SESSIONS_COLLECTION,
        timeoutInMilliseconds:
          this.options?.payments?.timeoutInMilliseconds ??
          this.options?.timeoutInMilliseconds,
      });
    }
    return this._payments;
  }
}
