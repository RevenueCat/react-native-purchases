import RevenueCatUI from "../react-native-purchases-ui";
import type { CustomerInfo, PurchasesError, REFUND_REQUEST_STATUS } from "@revenuecat/purchases-typescript-internal";
import type { CustomerCenterManagementOption, CustomerCenterManagementOptionEvent } from "../react-native-purchases-ui/src";
// Basic API validation
async function checkPresentCustomerCenter() {
  await RevenueCatUI.presentCustomerCenter();
}

// API validation with callbacks
async function checkWithCallbacks() {
  await RevenueCatUI.presentCustomerCenter({
    callbacks: {
      onFeedbackSurveyCompleted: ({ feedbackSurveyOptionId }: { feedbackSurveyOptionId: string }) => {},
      onShowingManageSubscriptions: () => {},
      onRestoreStarted: () => {},
      onRestoreCompleted: ({ customerInfo }: { customerInfo: CustomerInfo }) => {},
      onRestoreFailed: ({ error }: { error: PurchasesError }) => {},
      onRefundRequestStarted: ({ productIdentifier }: { productIdentifier: string }) => {},
      onRefundRequestCompleted: ({ productIdentifier, refundRequestStatus }: { productIdentifier: string; refundRequestStatus: REFUND_REQUEST_STATUS }) => {},
      onManagementOptionSelected: ({option, url}: CustomerCenterManagementOptionEvent) => {},
    }
  });
}