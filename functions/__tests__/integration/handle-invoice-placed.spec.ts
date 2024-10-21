import * as admin from "firebase-admin";
import {firestoreWaitForDocumentExist} from "../helpers/firestore.util";
import {configResolveCheckoutSessionDocumentPath} from "../../src/helpers";
import {expect} from "chai";
import server from "../helpers/liqpay-server";
import {Request, Response} from "express";
import {firebaseInitializeAppIfNeeded} from "../helpers/firebase.util";

firebaseInitializeAppIfNeeded();

const firestore = admin.firestore();

describe("handleInvoicePlaced", () => {
  context("when LiqPay responds with PaymentPageURL", () => {

    before(async () => {
      await server.start((app) => {
        app.post("/3/checkout", (req: Request, res: Response) => {
          // Customize the response based on the request data
          res.redirect(302, "https://example.com");
        });
      });

    });

    after(() => {
      server.close();
    });

    it("should create Checkout Session", async () => {
      const invoice = {
        orderId: "order-0011",
        amount: 100,
        currency: "USD",
      }

      const invoiceId = await firestore.collection("invoices")
        .add(invoice)
        .then(doc => doc.id);

      const session = await firestoreWaitForDocumentExist(
        firestore.doc(
          configResolveCheckoutSessionDocumentPath(invoice, invoiceId),
        ),
      );

      expect(session).to.have.property("paymentPageURL", "https://example.com");
      expect(session).to.have.property("status", "pending");
      expect(session).to.have.property("invoiceId", invoiceId);
    });

  });

  context("when LiqPay responds with an error", () => {

    before(async () => {
      await server.start((app) => {
        app.post("/3/checkout", (req: Request, res: Response) => {
          res.status(500).send("Internal Server Error");
        });
      });

    });

    after(() => {
      server.close();
    });

    it("should create Checkout Session with status 'failure'", async () => {
      const invoice = {
        orderId: "order-0012",
        amount: 100,
        currency: "USD",
      }

      const invoiceId = await firestore.collection("invoices")
        .add(invoice)
        .then(doc => doc.id);

      const session = await firestoreWaitForDocumentExist(
        firestore.doc(
          configResolveCheckoutSessionDocumentPath(invoice, invoiceId),
        ),
      );

      expect(session).to.have.property("status", "failure");
      expect(session).to.have.property("invoiceId", invoiceId);
      expect(session).to.have.property("errorCode", "HTTP_500");
      expect(session).to.have.property("errorMessage", "Internal Server Error");
    });

  });

});
