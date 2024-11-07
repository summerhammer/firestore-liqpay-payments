# firestore-liqpay-node-client
This package helps you integrate your Firebase Cloud Functions app with the
[`firestore-liqpay-payments`](https://extensions.dev/extensions/summerhammer/firestore-liqpay-payments) extension. 
It simplifies all the usual Firestore queries and other database operations 
needed to use the extension. Additionally, it offers type definitions for all 
the common object types used by the extension during payment processing.

## Example usage

### Initialize the Client

Ensure you have initialized the Firebase Admin SDK [as described here](https://firebase.google.com/docs/admin/setup#initialize-sdk).

Then create a new instance of the `FirestoreLiqpayClient` class and configure 
the client to use the same Firestore collections you configured the extension to use.

```typescript
import { FirestoreLiqpayClient } from "firestore-liqpay-node-client";
const client = new FirestoreLiqpayClient({
  // The name of the Firestore collection where invoices are stored, it should 
  // match the value of the `INVOICES_COLLECTION` parameter you set when 
  // configuring the extension.
  invoicesCollection: "invoices", 
  // The name of the Firestore collection where checkout sessions are stored, 
  // it should match the value of the `SESSIONS_COLLECTION` parameter you set
  // when configuring the extension.
  sessionsCollection: "sessions",
});
```

### Place a new invoice to initiate a payment

To place a new invoice and initiate a payment, call the `placeInvoice` method
on the `PaymentsClient` client instance. The method returns a 
`CheckoutSession` object that contains the URL of the payment page where the
user can complete the payment.

```typescript
const client = FirestoreLiqpayClient.createDefault();

// Invoice here is your custom object that you use to track the payment, 
// it could be an order object or any other object that you want to associate
// with the payment.
const invoice = createInvoice();

try {
  const session: CheckoutSession = 
    await client.payments.placeInvoice(invoice.toDatabaseObject());
  // Redirect the user to the payment page URL to complete the Checkout
  console.log("Payment Page URL:", session.paymentPageURL);
} catch (error) {
  console.error("Failed to place invoice", error);
}
```

## Dependencies
* Firebase Admin SDK (`firebase-admin`)
