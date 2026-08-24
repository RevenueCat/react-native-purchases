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

  it("leave successful calls alone", async () => {
    NativeModules.RNPurchases.getCustomerInfo.mockResolvedValueOnce(global.customerInfoStub);

    await expect(Purchases.getCustomerInfo()).resolves.toBeTruthy();
  });
});
