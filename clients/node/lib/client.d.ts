import { PaymentsClient, PaymentsClientOptions } from "./payments";
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
export declare class FirestoreLiqPayClient {
    private readonly options?;
    /**
     * Creates a new instance of the Firestore LiqPay client with default options.
     */
    static createDefault(): FirestoreLiqPayClient;
    /**
     * Creates a new instance of the Firestore LiqPay client with the provided
     * options.
     *
     * @param options - The options for the client.
     */
    constructor(options?: FirestoreLiqPayClientOptions | undefined);
    private _payments;
    /**
     * A client for interacting with the Firestore LiqPay Payments extension.
     */
    get payments(): PaymentsClient;
}
//# sourceMappingURL=client.d.ts.map