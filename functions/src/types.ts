import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot
} from "firebase-admin/firestore";

export interface CheckoutSession {
  status: "pending" | "cancelled" | "success" | "failure";
  paymentPageURL: string | null;
  invoiceId: string;
  transactionId: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  errorDetails: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const CHECKOUT_SESSION_CONVERTER: FirestoreDataConverter<CheckoutSession> = {
  toFirestore(invoice: CheckoutSession): DocumentData {
    return {
      status: invoice.status,
      invoiceId: invoice.invoiceId,
      paymentPageURL: invoice.paymentPageURL ?? null,
      transactionId: invoice.transactionId ?? null,
      errorCode: invoice.errorCode ?? null,
      errorMessage: invoice.errorMessage ?? null,
      errorDetails: invoice.errorDetails ?? null,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): CheckoutSession {
    const data = snapshot.data();
    return {
      status: data.status,
      invoiceId: data.invoiceId,
      paymentPageURL: data.paymentPageURL ?? null,
      transactionId: data.transactionId ?? null,
      errorCode: data.errorCode ?? null,
      errorMessage: data.errorMessage ?? null,
      errorDetails: data.errorDetails ?? null,
      createdAt: snapshot.createTime.toDate(),
      updatedAt: snapshot.updateTime.toDate(),
    };
  },
}
