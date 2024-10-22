Use this extension to set up payments via [LiqPay](https://www.liqpay.ua/en) Checkout.

This extension supports one-time and subscription payments with the
[LiqPay Checkout](https://www.liqpay.ua/en/doc/api/internet_acquiring/checkout)
service. It is designed to be highly flexible and can be customized to meet your 
specific needs through the use of JSONata expressions.

The extension performs the following tasks:
- Monitors the `INVOICES_COLLECTION` collection and processes invoices that use the `liqpay` payment method.
- Based on invoice data, it generates a checkout request, sends it to LiqPay, and receives a payment URL.
- Creates a checkout session object and stores it in the `SESSIONS_COLLECTION` collection.
- Listens for payment status updates from LiqPay via a webhook and updates the checkout session object accordingly.

## Types Used by the Extension

| Type            | Source    | Description                                                                                                                                                                                                                                                                                                                                                                                  |
|-----------------|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Invoice         | Your app  | The extension does not enforce any specific structure for this object. You can use your existing invoice, order, or other data type. However, the restriction is on where these objects are stored: the extension requires them to be accessible without additional context, meaning they should reside in a top-level Firestore collection.                                                                  |
| CheckoutRequest | LiqPay    | A data structure required by LiqPay's [/checkout](https://www.liqpay.ua/en/doc/api/internet_acquiring/checkout) endpoint. The extension translates your `Invoice` into a `CheckoutRequest` using a JSONata expression defined by the `INVOICE_TO_CHECKOUT_REQUEST_JSONATA` parameter.                                                                                                                        |
| CheckoutSession | Extension | The extension uses the `CheckoutSession` object to track payment status. These sessions are stored in the `SESSIONS_COLLECTION` collection. When specifying this collection's path, you can use tokens from the `Invoice` type for additional context. For example, in `customers/{customerId}/checkout-sessions`, the `customerId` will be replaced by the corresponding `Invoice.customerId` value. |

### Events

This extension emits events, allowing you to trigger custom logic at various 
stages during the extension's operation.

#### Additional Setup

Before installing this extension, ensure that you have
[set up a Cloud Firestore database](https://firebase.google.com/docs/firestore/quickstart)
in your Firebase project.

Next, in the [LiqPay Dashboard](https://www.liqpay.ua/authorization), obtain your
`public_key` and `private_key`, as described in the [documentation](https://www.liqpay.ua/doc).

#### Billing

This extension uses the following Firebase services, which may incur charges:

- Cloud Firestore
- Cloud Functions
- Cloud Secret Manager
- If events are enabled, [Eventarc fees apply](https://cloud.google.com/eventarc/pricing).

Additionally, this extension interacts with the following third-party service:

- LiqPay Checkout ([pricing information](https://www.liqpay.ua/en/tariffs))

You are responsible for any costs associated with your use of these services.

#### Note from Firebase

To install this extension, your Firebase project must be on the Blaze 
(pay-as-you-go) plan. You will only be charged for the resources you use. 
Many Firebase services offer a free tier for low-volume use. 
[Learn more about Firebase billing.](https://firebase.google.com/pricing)

Starting August 17, 2020, you will be charged a small fee (usually less than 
$0.10) when you install or reconfigure this extension. See the 
[Cloud Functions for Firebase billing FAQ](https://firebase.google.com/support/faq#expandable-15) 
for more details.
