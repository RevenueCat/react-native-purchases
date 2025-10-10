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
      onCustomActionSelected: ({ actionId, purchaseIdentifier }: { actionId: string; purchaseIdentifier?: string | null }) => {},
    }
  });
}

// Test onCustomActionSelected callback variations
async function checkWithoutPurchaseIdCallback() {
  await RevenueCatUI.presentCustomerCenter({
    callbacks: {
      // Callback without purchaseIdentifier parameter
      onCustomActionSelected: ({ actionId }: { actionId: string }) => {
        const id: string = actionId;
        void id;
      },
    }
  });
}

async function checkWithPurchaseIdCallback() {
  await RevenueCatUI.presentCustomerCenter({
    callbacks: {
      // Callback with purchaseIdentifier parameter
      onCustomActionSelected: ({ actionId, purchaseIdentifier }: { actionId: string; purchaseIdentifier?: string | null }) => {
        const id: string = actionId;
        const identifier: string | null = purchaseIdentifier ?? null;
        void id;
        void identifier;
      },
    }
  });
}