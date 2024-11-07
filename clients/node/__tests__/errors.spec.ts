import { expect } from "chai";
import {FirestoreLiqPayError} from "../src";

describe("FirestoreLiqPayError", () => {
  it("creates an error with the correct code and message", () => {
    const error = new FirestoreLiqPayError("timeout", "Operation timed out");
    expect(error.code).to.equal("timeout");
    expect(error.message).to.equal("Operation timed out");
  });

  it("creates an error with an optional cause", () => {
    const cause = new Error("Underlying error");
    const error = new FirestoreLiqPayError("internal", "Internal error occurred", cause);
    expect(error.code).to.equal("internal");
    expect(error.message).to.equal("Internal error occurred");
    expect(error.cause).to.equal(cause);
  });

  it("creates an error without a cause", () => {
    const error = new FirestoreLiqPayError("invalid-argument", "Invalid argument provided");
    expect(error.code).to.equal("invalid-argument");
    expect(error.message).to.equal("Invalid argument provided");
    expect(error.cause).to.be.undefined;
  });

  it("inherits from the Error class", () => {
    const error = new FirestoreLiqPayError("timeout", "Operation timed out");
    expect(error).to.be.instanceOf(Error);
  });
});
