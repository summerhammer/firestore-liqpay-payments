import axios from "axios";
import { expect } from "chai";

describe("firestore-liqpay-payments", () => {
  it("should respond with the configured greeting", async () => {
    const expected = "Hello World from firestore-liqpay-payments";

    const httpFunctionUri = "http://localhost:5001/demo-test/us-central1/ext-firestore-liqpay-payments-greetTheWorld/";
    const res = await axios.get(httpFunctionUri);

    return expect(res.data).to.eql(expected);
  }).timeout(10000);
});
