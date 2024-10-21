import {NodeFetchLiqPayClient} from "./impl/node-fetch.client";
import {LiqPayClient, LiqPayClientConfig} from "./client";

export function createLiqPayClient(
  config: LiqPayClientConfig,
): LiqPayClient {
  return new NodeFetchLiqPayClient(config);
}
