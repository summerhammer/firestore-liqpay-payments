#### Set Your Cloud Firestore Security Rules

To ensure that only your app can access the data in your Firestore database, you need to configure security rules. Use the rules below to restrict access as recommended in your project's [Cloud Firestore rules](https://console.firebase.google.com/project/${param:PROJECT_ID}/firestore/rules):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /${param:INVOICES_COLLECTION}/{id} {
      allow read: if request.auth.uid == resource.data.author_uid;
    }

    match /${param:SESSIONS_COLLECTION}/{id} {
      allow read, write: if request.auth.uid == request.resource.data.author_uid;
    }
  }
}
```

#### Make sure the Webhook is set up
The extension automatically sets up a webhook that listens for events from the 
LiqPay server. This webhook is configured to listen at the following URL: 
`${param:WEBHOOK_URL}`. Ensure that this URL is correctly deployed in your 
Firebase project.

### Using the extension

1. Insert an `Invoice` object into the `${param:INVOICES_COLLECTION}` collection. 
   The object should follow a structure compatible with the JSONata expression 
   specified in the `INVOICE_TO_CHECKOUT_REQUEST_JSONATA` parameter during 
   installation.
2. Monitor the `${param:SESSIONS_COLLECTION}` collection for updates. 
   The status field of the `CheckoutSession` object reflects the payment status, 
   which can be pending, succeeded, failed, or cancelled.
3. If the payment fails, you can find error details in the `errorCode` and 
   `errorMessage` fields of the CheckoutSession object.
4. If you have Eventarc enabled, you can listen for the events emitted by the 
   extension:
    - `dev.summerhammer.firestore-liqpay-payments.v1.checkout-session.created`: Emitted when a CheckoutSession object is created.
    - `dev.summerhammer.firestore-liqpay-payments.v1.checkout-session.updated`: Emitted when a CheckoutSession object is updated.
    - `dev.summerhammer.firestore-liqpay-payments.v1.payment-status.received`: Emitted when the extension receives a payment status update from LiqPay.
