import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase-admin/firestore";

export interface Invoice {
  invoiceId: string;
  amount: number;
  currency: string;
  description: string;
  subscription?: Subscription;
  customerId: string,
}

export interface Subscription {
  start: Date;
  periodicity: string;
}

export const INVOICE_CONVERTER: FirestoreDataConverter<Invoice> = {
  toFirestore(invoice: Invoice): DocumentData {
    return {
      invoiceId: invoice.invoiceId,
      amount: invoice.amount,
      currency: invoice.currency,
      description: invoice.description,
      subscription: invoice.subscription ?
        SUBSCRIPTION_CONVERTER.toFirestore(invoice.subscription) :
        null,
      customerId: invoice.customerId,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Invoice {
    const data = snapshot.data();
    return {
      invoiceId: data.invoiceId,
      amount: data.amount,
      currency: data.currency,
      description: data.description,
      subscription: data.subscription ?
        SUBSCRIPTION_CONVERTER.fromFirestore(snapshot) :
        undefined,
      customerId: data.customerId,
    };
  },
};


export const SUBSCRIPTION_CONVERTER: FirestoreDataConverter<Subscription> = {
  toFirestore(subscription: Subscription): DocumentData {
    return {
      start: Timestamp.fromDate(new Date(subscription.start)),
      periodicity: subscription.periodicity,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Subscription {
    const data = snapshot.data();
    return {
      start: data.start.toDate(),
      periodicity: data.periodicity,
    };
  },
};
