import React from "react";
import type { ComponentProps } from "react";

import RevenueCatUI from "react-native-purchases-ui";
import type {
  CustomerCenterCallbacks,
  CustomerCenterManagementOption,
  CustomerCenterManagementOptionEvent,
  PresentCustomerCenterParams,
} from "react-native-purchases-ui";
import type {
  CustomerInfo,
  PurchasesError,
  REFUND_REQUEST_STATUS,
} from "@revenuecat/purchases-typescript-internal";

async function checkPresentCustomerCenter() {
  await RevenueCatUI.presentCustomerCenter();
}

async function checkPresentCustomerCenterWithCallbacks(
  callbacks: CustomerCenterCallbacks,
) {
  await RevenueCatUI.presentCustomerCenter({
    callbacks,
  });
}

const customerCenterCallbacks: CustomerCenterCallbacks = {
  onFeedbackSurveyCompleted: ({ feedbackSurveyOptionId }) => {
    const optionId: string = feedbackSurveyOptionId;
    void optionId;
  },
  onShowingManageSubscriptions: () => {},
  onRestoreStarted: () => {},
  onRestoreCompleted: ({ customerInfo }) => {
    const info: CustomerInfo = customerInfo;
    void info;
  },
  onRestoreFailed: ({ error }) => {
    const purchasesError: PurchasesError = error;
    void purchasesError;
  },
  onRefundRequestStarted: ({ productIdentifier }: { productIdentifier: string }) => {
    const identifier: string = productIdentifier;
    // Prove this works cross-platform: log a message that will be visible during testing
    console.log(`[API TEST] Refund request started for product: ${identifier}`);
    void identifier;
  },
  onRefundRequestCompleted: ({ productIdentifier, refundRequestStatus }: { productIdentifier: string; refundRequestStatus: REFUND_REQUEST_STATUS }) => {
    const identifier: string = productIdentifier;
    const status: REFUND_REQUEST_STATUS = refundRequestStatus;
    // Prove this works cross-platform: log a message that will be visible during testing  
    console.log(`[API TEST] Refund request completed for product: ${identifier}, status: ${status}`);
    void identifier;
    void status;
  },
  onManagementOptionSelected: (event) => {
    const managementOptionEvent: CustomerCenterManagementOptionEvent = event;
    handleManagementOptionEvent(managementOptionEvent);
  },
  onCustomActionSelected: ({ actionId, purchaseIdentifier }) => {
    const id: string = actionId;
    const identifier: string | null = purchaseIdentifier ?? null;
    void id;
    void identifier;
  },
};

function handleManagementOptionEvent(
  event: CustomerCenterManagementOptionEvent,
) {
  if (typeof event.url === "string") {
    const option: CustomerCenterManagementOption = event.option;
    const url: string = event.url;
    void option;
    void url;
  } else {
    const option: Exclude<CustomerCenterManagementOption, "custom_url"> = event.option;
    const url: null = event.url;
    void option;
    void url;
  }
}

const customerCenterElement = (
  <RevenueCatUI.CustomerCenterView
    shouldShowCloseButton={false}
    onDismiss={() => {}}
    onCustomActionSelected={({ actionId, purchaseIdentifier }) => {
      const id: string = actionId;
      const identifier: string | null = purchaseIdentifier ?? null;
      void id;
      void identifier;
    }}
    onFeedbackSurveyCompleted={({ feedbackSurveyOptionId }) => {
      const optionId: string = feedbackSurveyOptionId;
      void optionId;
    }}
    onShowingManageSubscriptions={() => {}}
    onRestoreStarted={() => {}}
    onRestoreCompleted={({ customerInfo }) => {
      const info: CustomerInfo = customerInfo;
      void info;
    }}
    onRestoreFailed={({ error }) => {
      const purchasesError: PurchasesError = error;
      void purchasesError;
    }}
    onRefundRequestStarted={({ productIdentifier }) => {
      const identifier: string = productIdentifier;
      void identifier;
    }}
    onRefundRequestCompleted={({ productIdentifier, refundRequestStatus }) => {
      const identifier: string = productIdentifier;
      const status: REFUND_REQUEST_STATUS = refundRequestStatus;
      void identifier;
      void status;
    }}
    onManagementOptionSelected={(event) => {
      const managementOptionEvent: CustomerCenterManagementOptionEvent = event;
      handleManagementOptionEvent(managementOptionEvent);
    }}
    style={{ flex: 1 }}
  />
);

type CustomerCenterViewProps = ComponentProps<typeof RevenueCatUI.CustomerCenterView>;

const customerCenterViewProps: CustomerCenterViewProps = {
  onDismiss: () => {},
  onCustomActionSelected: ({ actionId, purchaseIdentifier }) => {
    const id: string = actionId;
    const identifier: string | null = purchaseIdentifier ?? null;
    void id;
    void identifier;
  },
  onFeedbackSurveyCompleted: ({ feedbackSurveyOptionId }) => {
    const optionId: string = feedbackSurveyOptionId;
    void optionId;
  },
  onShowingManageSubscriptions: () => {},
  onRestoreStarted: () => {},
  onRestoreCompleted: ({ customerInfo }) => {
    const info: CustomerInfo = customerInfo;
    void info;
  },
  onRestoreFailed: ({ error }) => {
    const purchasesError: PurchasesError = error;
    void purchasesError;
  },
  onRefundRequestStarted: ({ productIdentifier }: { productIdentifier: string }) => {
    const identifier: string = productIdentifier;
    void identifier;
  },
  onRefundRequestCompleted: ({ productIdentifier, refundRequestStatus }: { productIdentifier: string; refundRequestStatus: REFUND_REQUEST_STATUS }) => {
    const identifier: string = productIdentifier;
    const status: REFUND_REQUEST_STATUS = refundRequestStatus;
    void identifier;
    void status;
  },
  onManagementOptionSelected: (event) => {
    const managementOptionEvent: CustomerCenterManagementOptionEvent = event;
    handleManagementOptionEvent(managementOptionEvent);
  },
  shouldShowCloseButton: true,
  style: { flex: 1 },
};

void customerCenterViewProps;

const presentCustomerCenterParams: PresentCustomerCenterParams = {
  callbacks: customerCenterCallbacks,
};

// Test without purchaseIdentifier parameter (only actionId)
const withoutPurchaseIdCallback = ({ actionId }: { actionId: string }) => {
  const id: string = actionId;
  void id;
};

// Test with purchaseIdentifier parameter (actionId + purchaseIdentifier)
const withPurchaseIdCallback = ({ actionId, purchaseIdentifier }: { actionId: string; purchaseIdentifier?: string | null }) => {
  const id: string = actionId;
  const identifier: string | null = purchaseIdentifier ?? null;
  void id;
  void identifier;
};

// Test cases demonstrating both work
const backwardCompatibleElement1 = (
  <RevenueCatUI.CustomerCenterView
    shouldShowCloseButton={false}
    onDismiss={() => {}}
    onCustomActionSelected={withoutPurchaseIdCallback}
    style={{ flex: 1 }}
  />
);

const backwardCompatibleElement2 = (
  <RevenueCatUI.CustomerCenterView
    shouldShowCloseButton={false}
    onDismiss={() => {}}
    onCustomActionSelected={withPurchaseIdCallback}
    style={{ flex: 1 }}
  />
);

// Test specifically for iOS-only refund callbacks (will compile on both platforms)
async function testRefundCallbacks() {
  await RevenueCatUI.presentCustomerCenter({
    callbacks: {
      // iOS-only callbacks - these will never fire on Android but should compile fine
      onRefundRequestStarted: ({ productIdentifier }: { productIdentifier: string }) => {
        console.log(`[REFUND TEST] iOS refund started: ${productIdentifier}`);
        // Prove TypeScript knows this is a string
        const productId: string = productIdentifier;
        return productId.length > 0;
      },
      onRefundRequestCompleted: ({ productIdentifier, refundRequestStatus }: { productIdentifier: string; refundRequestStatus: REFUND_REQUEST_STATUS }) => {
        console.log(`[REFUND TEST] iOS refund completed: ${productIdentifier} with status ${refundRequestStatus}`);
        // Prove TypeScript knows the correct types
        const productId: string = productIdentifier;
        const status: REFUND_REQUEST_STATUS = refundRequestStatus;
        return productId.length > 0 && status !== null;
      },
    },
  });
}

void customerCenterElement;
void presentCustomerCenterParams;
void backwardCompatibleElement1;
void backwardCompatibleElement2;
void testRefundCallbacks;

export {
  checkPresentCustomerCenter,
  checkPresentCustomerCenterWithCallbacks,
  customerCenterCallbacks,
  presentCustomerCenterParams,
  withoutPurchaseIdCallback,
  withPurchaseIdCallback,
  testRefundCallbacks,
};
