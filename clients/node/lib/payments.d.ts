import { CheckoutSession } from "./session";
/**
 * Default timeout for waiting for a payment to be created.
 */
export declare const DEFAULT_PAYMENTS_TIMEOUT_IN_MILLISECONDS: number;
/**
 * Default Firestore collection name for invoices.
 */
export declare const DEFAULT_INVOICES_COLLECTION = "invoices";
/**
 * Default Firestore collection name for checkout sessions.
 */
export declare const DEFAULT_SESSIONS_COLLECTION = "checkout-sessions";
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
export declare class PaymentsClient {
    readonly options: PaymentsClientOptions;
    /**
     * Creates a new instance of the PaymentsClient.
     * @param options - The options for the client.
     */
    constructor(options: PaymentsClientOptions);
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
    placeInvoice(invoice: Record<any, any>, options?: PlaceInvoiceOptions): Promise<CheckoutSession>;
    /**
     * Waits for a `CheckoutSession` document to be created in Firestore with a
     * @param ref The reference to the `CheckoutSession` document.
     * @param timeoutInMilliseconds The timeout in milliseconds to wait for the
     * `CheckoutSession` document to be created.
     * @private
     */
    private waitForCheckoutSessionWithPaymentPageURL;
    /**
     * Fetches a `CheckoutSession` document from Firestore.
     * @param invoiceId The ID of the invoice.
     * @param tokens Optional tokens to replace in the collection path.
     */
    fetchCheckoutSession(invoiceId: string, tokens?: Record<any, any>): Promise<CheckoutSession>;
    /**
     * Cancels a `CheckoutSession` document in Firestore.
     * @param invoiceId The ID of the invoice.
     * @param tokens Optional tokens to replace in the collection path.
     */
    cancelCheckoutSession(invoiceId: string, tokens?: Record<any, any>): Promise<void>;
    /**
     * Finds `CheckoutSession` documents in Firestore with a specific status.
     * @param status The status to filter by.
     * @param tokens Optional tokens to replace in the collection path.
     */
    findCheckoutSessionsWithStatus(status: "pending" | "cancelled" | "success" | "failure", tokens?: Record<any, any>): Promise<CheckoutSession[]>;
    /**
     * Finds `CheckoutSession` documents in Firestore with a status of "pending".
     * @param tokens Optional tokens to replace in the collection path.
     */
    findPendingCheckoutSessions(tokens?: Record<any, any>): Promise<CheckoutSession[]>;
    /**
     * Returns the timeout in milliseconds for waiting for a payment to be created.
     * @param timeout
     * @private
     */
    private getTimeoutInMilliseconds;
    private configResolveCheckoutSessionDocumentPath;
}
//# sourceMappingURL=payments.d.ts.map