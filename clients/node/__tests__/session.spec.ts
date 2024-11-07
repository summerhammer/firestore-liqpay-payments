import {DocumentData, QueryDocumentSnapshot} from "firebase-admin/firestore";
import {expect} from "chai";
import {CheckoutSession} from "../src";
import {CHECKOUT_SESSION_CONVERTER} from "../src/session";
import {firestore} from "firebase-admin";
import Timestamp = firestore.Timestamp;

describe("CHECKOUT_SESSION_CONVERTER", () => {
  it("converts CheckoutSession to Firestore DocumentData correctly", () => {
    const session: CheckoutSession = {
      status: "pending",
      paymentPageURL: "http://example.com",
      invoiceId: "invoice123",
      transactionId: "txn123",
      error: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = CHECKOUT_SESSION_CONVERTER.toFirestore(session);

    expect(result).to.deep.equal({
      status: "pending",
      invoiceId: "invoice123",
      paymentPageURL: "http://example.com",
      transactionId: "txn123",
      errorCode: null,
      errorMessage: null,
      errorDetails: null,
    });
  });

  it("converts Firestore DocumentData to CheckoutSession correctly", () => {
    const snapshot = createMockSnapshot({
      status: "success",
      invoiceId: "invoice123",
      paymentPageURL: "http://example.com",
      transactionId: "txn123",
      errorCode: null,
      errorMessage: null,
      errorDetails: null,
      createdAt: new Date("2023-10-01T00:00:00Z"),
      updatedAt: new Date("2023-10-02T00:00:00Z"),
    });

    const result = CHECKOUT_SESSION_CONVERTER.fromFirestore(snapshot);

    expect(result).to.deep.equal({
      status: "success",
      invoiceId: "invoice123",
      paymentPageURL: "http://example.com",
      transactionId: "txn123",
      error: null,
      createdAt: new Date("2023-10-01T00:00:00Z"),
      updatedAt: new Date("2023-10-02T00:00:00Z"),
    });
  });

  it("handles null values in Firestore DocumentData correctly", () => {
    const snapshot = createMockSnapshot({
      status: "failure",
      invoiceId: "invoice123",
      paymentPageURL: null,
      transactionId: null,
      errorCode: "ERR001",
      errorMessage: "Payment failed",
      errorDetails: "Insufficient funds",
      createdAt: new Date("2023-10-01T00:00:00Z"),
      updatedAt: new Date("2023-10-02T00:00:00Z"),
    })

    const result = CHECKOUT_SESSION_CONVERTER.fromFirestore(snapshot);

    expect(result).to.deep.equal({
      status: "failure",
      invoiceId: "invoice123",
      paymentPageURL: null,
      transactionId: null,
      error: {
        code: "ERR001",
        message: "Payment failed",
        details: "Insufficient funds",
      },
      createdAt: new Date("2023-10-01T00:00:00Z"),
      updatedAt: new Date("2023-10-02T00:00:00Z"),
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
