import {PaymentStatus} from "../../src/liqpay/dto/payment-status.response";
import {LiqPayCrypto} from "../../src/liqpay/crypto/liq-pay-crypto";
// @ts-ignore
import localtunnel, {Tunnel} from "localtunnel";

export async function webhookSendPaymentStatus(
  status: Partial<PaymentStatus>,
): Promise<void> {
  await fetch("http://127.0.0.1:9001/demo-test/us-central1/ext-firestore-liqpay-payments-handlePaymentStatus", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: encodeRequest({
      ...status,
      public_key: process.env.LIQPAY_PUBLIC_KEY,
    }),
  })
}

function encodeRequest(request: Record<any, any>): string {
  const data = Buffer.from(JSON.stringify(request)).toString("base64");
  const crypto = new LiqPayCrypto(
    process.env.LIQPAY_PRIVATE_KEY as string,
  );
  const signature = crypto.encode(data);
  return JSON.stringify({
    data: data,
    signature: signature
  });
}

export async function webhookExposeEndpoints(): Promise<Tunnel> {
  console.log("LocalTunnel: Exposing webhook endpoints...");
  const tunnel = await localtunnel({
    subdomain: "firestore-liqpay-payments",
    port: 9001,
  });
  console.log("LocalTunnel: Exposed webhook endpoints at", tunnel.url);
  tunnel.on("close", () => {
    console.log("LocalTunnel: Closed");
  });
  return tunnel;
}
