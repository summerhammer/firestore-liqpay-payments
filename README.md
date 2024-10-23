# firestore-liqpay-payments

A [Firebase Extension](https://firebase.google.com/products/extensions) that 
integrates [LiqPay](https://www.liqpay.ua/en) payments with Cloud Firestore.

### Development Notes

#### E2E Testing
Currently, the E2E tests could fail if the **localtunnel** tunnelled to a random
address instead of the expected one. This could be a temporary issue with the
**localtunnel** service. If this happens, you can create a tunnel manually using 
**localltunnel** or **ngrok** replace the `WEBHOOK_URL` in the [firestore-liqpay-payments.env.local](functions%2Fintegration-tests%2Fextensions%2Ffirestore-liqpay-payments.env.local)
and run the tests again.

#### Integration Tests
The integration tests require you to override the `LIQPAY_BASE_URL` in the
[firestore-liqpay-payments.env.local](functions%2Fintegration-tests%2Fextensions%2Ffirestore-liqpay-payments.env.local)
by setting it to `LIQPAY_BASE_URL=http://localhost:3000`, if the port 3000 is
already in use, you need to change the port to a free one in the [liqpay-server.ts](functions%2F__tests__%2Fhelpers%2Fliqpay-server.ts)
