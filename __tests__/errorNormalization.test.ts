import { NativeModules } from "react-native";
import type { PurchasesError } from "@revenuecat/purchases-typescript-internal";

import Purchases from "../src/purchases";

/**
 * The shape React Native builds on Android: PromiseImpl sends code, message and
 * userInfo, and RNPurchasesModule passes ErrorContainer.info as that userInfo.
 */
function nativeRejection(): Error {
  return Object.assign(new Error("There was a credentials issue."), {
    code: "11",
    message: "There was a credentials issue.",
    userInfo: {
      code: 11,
      message: "There was a credentials issue.",
      readableErrorCode: "InvalidCredentialsError",
      readable_error_code: "InvalidCredentialsError",
      underlyingErrorMessage: "Invalid API Key.",
    },
    nativeStackAndroid: [],
  });
}

describe("errors rejected by the native module", () => {
  beforeEach(() => {
    NativeModules.RNPurchases.isConfigured.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("match the PurchasesError interface", async () => {
    NativeModules.RNPurchases.getCustomerInfo.mockRejectedValueOnce(nativeRejection());

    const error: PurchasesError = await Purchases.getCustomerInfo().catch((caught: unknown) => caught);

    expect(error.code).toBe("11");
    expect(error.readableErrorCode).toBe("InvalidCredentialsError");
    expect(error.underlyingErrorMessage).toBe("Invalid API Key.");
    expect(error.userInfo.readableErrorCode).toBe("InvalidCredentialsError");
    expect(error.userCancelled).toBeNull();
  });

  it("stay real Errors", async () => {
    NativeModules.RNPurchases.getCustomerInfo.mockRejectedValueOnce(nativeRejection());

    const error = await Purchases.getCustomerInfo().catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(Error);
    expect(typeof (error as Error).stack).toBe("string");
  });

  // Android already nests the payload here; overwriting userInfo with the single
  // field ErrorInfo declares would drop the rest.
  it("keep the fields userInfo already carried", async () => {
    NativeModules.RNPurchases.getCustomerInfo.mockRejectedValueOnce(nativeRejection());

    const error = await Purchases.getCustomerInfo().catch((caught: unknown) => caught);

    expect((error as { userInfo: Record<string, unknown> }).userInfo.underlyingErrorMessage).toBe("Invalid API Key.");
    expect((error as { userInfo: Record<string, unknown> }).userInfo.readable_error_code).toBe(
      "InvalidCredentialsError"
    );
  });

  it("leave successful calls alone", async () => {
    NativeModules.RNPurchases.getCustomerInfo.mockResolvedValueOnce(global.customerInfoStub);

    await expect(Purchases.getCustomerInfo()).resolves.toBeTruthy();
  });
});
