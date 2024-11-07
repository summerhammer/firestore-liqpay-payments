import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";

/**
 * A checkout session in the Firestore LiqPay Payments extension.
 */
export interface CheckoutSession {
  /**
   * The status of the checkout session.
   */
  status: "pending" | "cancelled" | "success" | "failure";

  /**
   * The URL of the payment page for the checkout session.
   */
  paymentPageURL: string | null;

  /**
   * The ID of the invoice associated with the checkout session. This is the ID
   * of the application's invoice document you passed in the
   * `PaymentsClient.placeInvoice` method. This value is used to fill the
   * `order_id` field in the LiqPay Checkout request.
   */
  invoiceId: string;

  /**
   * The transaction ID of the payment. This value is filled after the payment
   * has been successfully processed.
   */
  transactionId: string | null;

  /**
   * The error code of the payment. This value is filled if the payment has
   * failed.
   */
  error: {
    code: string;
    message: string | null;
    details: string | null;
  } | null;

  /**
   * The creation time of the checkout session.
   */
  createdAt: Date;

  /**
   * The last update time of the checkout session.
   */
  updatedAt: Date;
}

export const CHECKOUT_SESSION_CONVERTER: FirestoreDataConverter<CheckoutSession> =
  {
    toFirestore(invoice: CheckoutSession): DocumentData {
      return {
        status: invoice.status,
        invoiceId: invoice.invoiceId,
        paymentPageURL: invoice.paymentPageURL ?? null,
        transactionId: invoice.transactionId ?? null,
        errorCode: invoice.error?.code ?? null,
        errorMessage: invoice.error?.message ?? null,
        errorDetails: invoice.error?.details ?? null,
      };
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): CheckoutSession {
      const data = snapshot.data();
      return {
        status: data.status,
        invoiceId: data.invoiceId,
        paymentPageURL: data.paymentPageURL ?? null,
        transactionId: data.transactionId ?? null,
        error: data.errorCode
          ? {
              code: data.errorCode,
              message: data.errorMessage ?? null,
              details: data.errorDetails ?? null,
            }
          : null,
        createdAt: snapshot.createTime.toDate(),
        updatedAt: snapshot.updateTime.toDate(),
      };
    },
  };
