import {expect} from "chai";
import {CHECKOUT_SESSION_CONVERTER, CheckoutSession} from "../../src/types";
import {
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp
} from "firebase-admin/firestore";

describe("CHECKOUT_SESSION_CONVERTER", () => {
  it("converts CheckoutSession to Firestore DocumentData", () => {
    const session = {
      status: "pending",
      paymentPageURL: "http://payment.page.url",
      invoiceId: "invoiceId",
      transactionId: "transactionId",
      createdAt: new Date("2023-10-01T00:00:00Z"),
      updatedAt: new Date("2023-10-02T00:00:00Z"),
    };

    const result = CHECKOUT_SESSION_CONVERTER.toFirestore(session as CheckoutSession);

    expect(result).to.deep.equal({
      status: "pending",
      paymentPageURL: "http://payment.page.url",
      invoiceId: "invoiceId",
      transactionId: "transactionId",
      errorCode: null,
      errorMessage: null,
      errorDetails: null,
    });
  });

  it("converts Firestore DocumentData to CheckoutSession", () => {
    const snapshot = createMockSnapshot({
      status: "success",
      paymentPageURL: "http://payment.page.url",
      invoiceId: "invoiceId",
      transactionId: "transactionId",
      createdAt: new Date("2023-10-01T00:00:00Z"),
      updatedAt: new Date("2023-10-02T00:00:00Z"),
    }) as QueryDocumentSnapshot;

    const result = CHECKOUT_SESSION_CONVERTER.fromFirestore(snapshot);

    expect(result).to.deep.equal({
      status: "success",
      paymentPageURL: "http://payment.page.url",
      invoiceId: "invoiceId",
      transactionId: "transactionId",
      createdAt: new Date("2023-10-01T00:00:00Z"),
      updatedAt: new Date("2023-10-02T00:00:00Z"),
      errorCode: null,
      errorMessage: null,
      errorDetails: null,
    });
  });

  it("handles null transactionId in toFirestore conversion", () => {
    const session = {
      status: "pending",
      paymentPageURL: "http://payment.page.url",
      invoiceId: "invoiceId",
      transactionId: null,
      createdAt: new Date("2023-10-01T00:00:00Z"),
      updatedAt: new Date("2023-10-02T00:00:00Z"),
      errorCode: null,
      errorMessage: null,
      errorDetails: null,
    };

    const result = CHECKOUT_SESSION_CONVERTER.toFirestore(session as CheckoutSession);

    expect(result).to.deep.equal({
      status: "pending",
      paymentPageURL: "http://payment.page.url",
      invoiceId: "invoiceId",
      transactionId: null,
      errorCode: null,
      errorMessage: null,
      errorDetails: null,
    });
  });

  it("handles null transactionId in fromFirestore conversion", () => {
    const snapshot = createMockSnapshot({
      status: "success",
      paymentPageURL: "http://payment.page.url",
      invoiceId: "invoiceId",
      transactionId: null,
      createdAt: new Date("2023-10-01T00:00:00Z"),
      updatedAt: new Date("2023-10-02T00:00:00Z"),
      errorCode: null,
      errorMessage: null,
      errorDetails: null,
    }) as QueryDocumentSnapshot;

    const result = CHECKOUT_SESSION_CONVERTER.fromFirestore(snapshot);

    expect(result).to.deep.equal({
      status: "success",
      paymentPageURL: "http://payment.page.url",
      invoiceId: "invoiceId",
      transactionId: null,
      createdAt: new Date("2023-10-01T00:00:00Z"),
      updatedAt: new Date("2023-10-02T00:00:00Z"),
      errorCode: null,
      errorMessage: null,
      errorDetails: null,
    });
  });
});

function createMockSnapshot(
  data: DocumentData & {createdAt: Date, updatedAt: Date},
): QueryDocumentSnapshot {
  return {
    createTime: Timestamp.fromDate(data.createdAt),
    updateTime: Timestamp.fromDate(data.updatedAt),
    exists: true,
    ref: {} as any, // Mock reference, replace with actual if needed
    id: "mockId",
    readTime: Timestamp.fromDate(new Date("2023-10-02T00:00:00Z")),
    size: 0,
    data: () => data,
    get: (field: string) => data[field],
    isEqual: () => false,
  } as QueryDocumentSnapshot;
}
