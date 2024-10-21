import * as admin from "firebase-admin";
import {firestoreCreatePendingCheckoutSession} from "../helpers/firestore.stub";
import {webhookSendPaymentStatus} from "../helpers/webhook.util";
import {expect} from "chai";
import server from "../helpers/liqpay-server";
import {Request, Response} from "express";
import {PaymentStatus} from "../../src/liqpay/dto/payment-status.response";
import {createLiqPayClient} from "../../src/liqpay";
import config from "../../src/config";
import {
  firestoreDeleteCollection,
  firestoreWaitForDocumentToExistWithFields
} from "../helpers/firestore.util";
import {Completer} from "../helpers/utils";
import {CheckoutSession} from "../../src/types";
import {firebaseInitializeAppIfNeeded} from "../helpers/firebase.util";

firebaseInitializeAppIfNeeded();

const firestore = admin.firestore();

describe("handlePaymentStatus", () => {
  context("when payment is successful", () => {
    afterEach(async () => {
      await firestoreDeleteCollection(firestore.collection("checkout-sessions"));
    });

    after(async () => {
      await server.close();
    });

    let liqPay = createLiqPayClient({
      privateKey: config.liqpayPrivateKey,
      publicKey: config.liqpayPublicKey,
      baseURL: config.liqpayBaseURL,
    });

    it("should explicitly get Payment Status again", async () => {
      const status = {
        order_id: "invoice-001",
        status: "success",
        action: "pay",
        version: 3,
        language: "en",
        transaction_id: 123,
      } as PaymentStatus;

      const explicitPaymentStatusRequestCompleter: Completer<any> = new Completer<any>();

      await server.start((app) => {
        app.post("/request", (req: Request, res: Response) => {
          const data = liqPay.decodePaymentStatus(req.body);
          expect(data).to.include({
            order_id: "invoice-001",
          });
          res.send({
            ...status,
            transaction_id: 456,
          });
          explicitPaymentStatusRequestCompleter.resolve(null);
        });
      });

      await webhookSendPaymentStatus(status);

      await explicitPaymentStatusRequestCompleter.promise;
      await server.close();

      await firestoreWaitForDocumentToExistWithFields(
        firestore.doc("checkout-sessions/invoice-001"),
        {
          status: "success",
          transactionId: "456",
        }
      );
    });

    it("should complete Checkout Session on successful payment", async () => {
      const status = {
        order_id: "invoice-002",
        status: "success",
        action: "pay",
        version: 3,
        language: "en",
        transaction_id: 123,
      } as PaymentStatus;

      await firestoreCreatePendingCheckoutSession(
        firestore,
        "invoice-002",
        "https://example.com",
      );

      await webhookSendPaymentStatus(status);

      const session = await firestore.doc("checkout-sessions/invoice-002").get();

      expect(session.data()).to.include({
        invoiceId: "invoice-002",
        status: "success",
        transactionId: "123",
      } as CheckoutSession);
    });

    it("should complete Checkout Session on subscribed", async () => {
      const status = {
        order_id: "invoice-005",
        status: "subscribed",
        action: "subscribe",
        version: 3,
        language: "en",
        transaction_id: 321,
      } as PaymentStatus;

      await firestoreCreatePendingCheckoutSession(
        firestore,
        "invoice-005",
        "https://example.com",
      );

      await webhookSendPaymentStatus(status);

      const session = await firestore.doc("checkout-sessions/invoice-005").get();

      expect(session.data()).to.include({
        invoiceId: "invoice-005",
        status: "success",
        transactionId: "321",
      } as CheckoutSession);
    });

  });

  context("when payment is failed", () => {
    afterEach(async () => {
      await firestoreDeleteCollection(firestore.collection("checkout-sessions"));
    });

    it("should complete Checkout Session on failed payment", async () => {
      const status = {
        order_id: "invoice-009",
        status: "failure",
        err_code: "TEST_FAILED",
        err_description: "Test failure error",
        action: "pay",
        version: 3,
        language: "en",
        transaction_id: 123,
      } as PaymentStatus;

      await firestoreCreatePendingCheckoutSession(
        firestore,
        "invoice-009",
        "https://example.com",
      );

      await webhookSendPaymentStatus(status);

      const session = await firestore.doc("checkout-sessions/invoice-009").get();

      expect(session.data()).to.include({
        invoiceId: "invoice-009",
        status: "failure",
        errorCode: "TEST_FAILED",
        errorMessage: "Test failure error",
        transactionId: "123",
      } as CheckoutSession);
    });

    it("should complete Checkout Session on error", async () => {
      const status = {
        order_id: "invoice-004",
        status: "error",
        err_code: "TEST_ERROR",
        err_description: "Test error",
        action: "pay",
        version: 3,
        language: "en",
        transaction_id: 234,
      } as PaymentStatus;

      await firestoreCreatePendingCheckoutSession(
        firestore,
        "invoice-004",
        "https://example.com",
      );

      await webhookSendPaymentStatus(status);

      const session = await firestore.doc("checkout-sessions/invoice-004").get();

      expect(session.data()).to.include({
        invoiceId: "invoice-004",
        status: "failure",
        errorCode: "TEST_ERROR",
        errorMessage: "Test error",
        transactionId: "234",
      } as CheckoutSession);
    });

  });

  context("when payment is cancelled", () => {
    afterEach(async () => {
      await firestoreDeleteCollection(firestore.collection("checkout-sessions"));
    });

    it("should mark Checkout Session as cancelled on payment refund", async () => {
      const status = {
        order_id: "invoice-007",
        status: "reversed",
        action: "pay",
        version: 3,
        language: "en",
        transaction_id: 654,
      } as PaymentStatus;

      await firestoreCreatePendingCheckoutSession(
        firestore,
        "invoice-007",
        "https://example.com",
      );

      await webhookSendPaymentStatus(status);

      const session = await firestore.doc("checkout-sessions/invoice-007").get();

      expect(session.data()).to.include({
        invoiceId: "invoice-007",
        status: "cancelled",
        transactionId: "654",
      } as CheckoutSession);
    });

    it("should mark Checkout Session as cancelled on subscription cancelled", async () => {
      const status = {
        order_id: "invoice-008",
        status: "unsubscribed",
        action: "subscribe",
        version: 3,
        language: "en",
        transaction_id: 654,
      } as PaymentStatus;

      await firestoreCreatePendingCheckoutSession(
        firestore,
        "invoice-008",
        "https://example.com",
      );

      await webhookSendPaymentStatus(status);

      const session = await firestore.doc("checkout-sessions/invoice-008").get();

      expect(session.data()).to.include({
        invoiceId: "invoice-008",
        status: "cancelled",
        transactionId: "654",
      } as CheckoutSession);
    });
  });

});
