/**
 * Error codes that can be thrown by the Firestore LiqPay client.
 */
export type FirestoreLiqPayErrorCode = "timeout" | "invalid-argument" | "not-found" | "internal";
/**
 * An error thrown by the Firestore LiqPay client.
 */
export declare class FirestoreLiqPayError extends Error {
    readonly code: FirestoreLiqPayErrorCode;
    readonly message: string;
    readonly cause?: any;
    constructor(code: FirestoreLiqPayErrorCode, message: string, cause?: any);
}
//# sourceMappingURL=errors.d.ts.map