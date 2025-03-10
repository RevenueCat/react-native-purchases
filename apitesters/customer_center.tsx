import RevenueCatUI from "../react-native-purchases-ui";
import type { CustomerInfo, PurchasesError } from "@revenuecat/purchases-typescript-internal";

// Basic API validation
async function checkPresentCustomerCenter() {
  await RevenueCatUI.presentCustomerCenter();
}

// API validation with callbacks
async function checkWithCallbacks() {
  await RevenueCatUI.presentCustomerCenter({
    onFeedbackSurveyCompleted: ({ feedbackSurveyOptionId }: { feedbackSurveyOptionId: string }) => {},
    onShowingManageSubscriptions: () => {},
    onRestoreStarted: () => {},
    onRestoreCompleted: ({ customerInfo }: { customerInfo: CustomerInfo }) => {},
    onRestoreFailed: ({ error }: { error: PurchasesError }) => {},
    onRefundRequestStarted: ({ productIdentifier }: { productIdentifier: string }) => {},
    onRefundRequestCompleted: ({ refundRequestStatus }: { refundRequestStatus: string }) => {}
  });
} 