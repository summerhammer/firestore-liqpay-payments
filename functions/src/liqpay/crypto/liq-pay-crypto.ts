import * as crypto from "node:crypto";

export class LiqPayCrypto {
  constructor(
    readonly privateKey: string,
  ) {}

  public encode(data: string): string {
    const string = `${this.privateKey}${data}${this.privateKey}`;
    const sha1 = crypto.createHash("sha1");
    sha1.update(string);
    return sha1.digest("base64");
  }

  public verify(data: string, signature: string): boolean {
    const encoded = this.encode(data);
    return encoded === signature;
  }
}
