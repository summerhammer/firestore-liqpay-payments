/**
 * Error codes that can be thrown by the Firestore LiqPay client.
 */
export type FirestoreLiqPayErrorCode =
  | "timeout"
  | "invalid-argument"
  | "not-found"
  | "internal";

/**
 * An error thrown by the Firestore LiqPay client.
 */
export class FirestoreLiqPayError extends Error {
  constructor(
    readonly code: FirestoreLiqPayErrorCode,
    readonly message: string,
    readonly cause?: any,
  ) {
    super(message);
  }
}
