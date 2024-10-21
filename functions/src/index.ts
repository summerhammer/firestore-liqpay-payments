import * as express from "express";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import {https} from "firebase-functions/v1";
import {createLiqPayClient} from "./liqpay";
import * as helpers from "./helpers";
import * as logs from "./logs";

import config from "./config";
import {LiqPayError} from "./liqpay/client";

admin.initializeApp();

const liqpay = createLiqPayClient({
  privateKey: config.liqpayPrivateKey,
  publicKey: config.liqpayPublicKey,
  baseURL: config.liqpayBaseURL,
});

exports.handleInvoicePlaced = functions
  .runWith({
    minInstances: config.handleInvoicePlacedMinInstances
  })
  .firestore.document(`${config.invoicesCollection}/{id}`)
  .onCreate(async (snapshot, context) => {
    logs.checkoutInvoiceWithId(context.params.id);

    const invoice = snapshot.data();
    try {
      const paymentPageURL = await liqpay.checkout(
        await helpers.translateInvoiceToCheckoutRequest(
          invoice,
          context.params.id,
        ),
      );
      logs.checkoutInvoiceWithIdSuccess(context.params.id, paymentPageURL);
      await helpers.firestoreUpdateDatabaseWithPaymentPageURL(
        invoice,
        context.params.id,
        paymentPageURL,
      );
    } catch (error) {
      await helpers.firestoreUpdateDatabaseWithFailedCheckout(
        invoice,
        context.params.id,
        error as LiqPayError,
      );
      logs.checkoutInvoiceWithIdError(context.params.id, error);
    }
  });

exports.handlePaymentStatus = https
  .onRequest(async (req: https.Request, res: express.Response) => {

    try {
      logs.handlePaymentStatus(req.body);
      let status = liqpay.decodePaymentStatus(req.body);
      await helpers.firestoreUpdateDatabaseWithPaymentStatus(status);
      logs.handlePaymentStatusSuccess(status);

      logs.getPaymentStatus(status.order_id);
      status = await liqpay.getPaymentStatus({
        order_id: status.order_id,
        action: "status",
        version: 3,
      });
      logs.getPaymentStatusSuccess(status);
      await helpers.firestoreUpdateDatabaseWithPaymentStatus(status);
      logs.handlePaymentStatusSuccess(status);
      res.status(200).send("OK");
    } catch (error) {
      logs.handlePaymentStatusError(error);
      res.status(500).send(error);
    }
  });
