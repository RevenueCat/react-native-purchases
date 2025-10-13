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

const withoutPurchaseIdCallback = ({ actionId }: { actionId: string }) => {
  const id: string = actionId;
  void id;
};

const withPurchaseIdCallback = ({ actionId, purchaseIdentifier }: { actionId: string; purchaseIdentifier: string | null }) => {
  const id: string = actionId;
  const identifier: string | null = purchaseIdentifier ?? null;
  void id;
  void identifier;
};

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

async function testRefundCallbacks() {
  await RevenueCatUI.presentCustomerCenter({
    callbacks: {
      onRefundRequestStarted: ({ productIdentifier }: { productIdentifier: string }) => {
        const productId: string = productIdentifier;
        return productId.length > 0;
      },
      onRefundRequestCompleted: ({ productIdentifier, refundRequestStatus }: { productIdentifier: string; refundRequestStatus: REFUND_REQUEST_STATUS }) => {
        const productId: string = productIdentifier;
        const status: REFUND_REQUEST_STATUS = refundRequestStatus;
        return productId.length > 0 && status !== null;
      },
    },
  });
}

const customerCenterViewWithLegacyCallback = (
  <RevenueCatUI.CustomerCenterView
    shouldShowCloseButton={true}
    onDismiss={() => {}}
    onCustomActionSelected={({ actionId }: { actionId: string }) => {
      const id: string = actionId;
      void id;
    }}
    style={{ flex: 1 }}
  />
);

const customerCenterViewWithNewCallback = (
  <RevenueCatUI.CustomerCenterView
    shouldShowCloseButton={true}
    onDismiss={() => {}}
    onCustomActionSelected={({ actionId, purchaseIdentifier }: { actionId: string; purchaseIdentifier: string | null }) => {
      const id: string = actionId;
      const identifier: string | null = purchaseIdentifier ?? null;
      void id;
      void identifier;
    }}
    style={{ flex: 1 }}
  />
);

const customerCenterViewAllCallbacks = (
  <RevenueCatUI.CustomerCenterView
    shouldShowCloseButton={false}
    onDismiss={() => {}}
    onFeedbackSurveyCompleted={({ feedbackSurveyOptionId }: { feedbackSurveyOptionId: string }) => {
      const optionId: string = feedbackSurveyOptionId;
      void optionId;
    }}
    onShowingManageSubscriptions={() => {}}
    onRestoreStarted={() => {}}
    onRestoreCompleted={({ customerInfo }: { customerInfo: CustomerInfo }) => {
      const info: CustomerInfo = customerInfo;
      void info;
    }}
    onRestoreFailed={({ error }: { error: PurchasesError }) => {
      const purchasesError: PurchasesError = error;
      void purchasesError;
    }}
    onRefundRequestStarted={({ productIdentifier }: { productIdentifier: string }) => {
      const identifier: string = productIdentifier;
      void identifier;
    }}
    onRefundRequestCompleted={({ productIdentifier, refundRequestStatus }: { productIdentifier: string; refundRequestStatus: REFUND_REQUEST_STATUS }) => {
      const identifier: string = productIdentifier;
      const status: REFUND_REQUEST_STATUS = refundRequestStatus;
      void identifier;
      void status;
    }}
    onManagementOptionSelected={(event: CustomerCenterManagementOptionEvent) => {
      const managementOptionEvent: CustomerCenterManagementOptionEvent = event;
      handleManagementOptionEvent(managementOptionEvent);
    }}
    onCustomActionSelected={({ actionId, purchaseIdentifier }: { actionId: string; purchaseIdentifier: string | null }) => {
      const id: string = actionId;
      const identifier: string | null = purchaseIdentifier ?? null;
      void id;
      void identifier;
    }}
    style={{ flex: 1 }}
  />
);

void customerCenterElement;
void presentCustomerCenterParams;
void backwardCompatibleElement1;
void backwardCompatibleElement2;
void testRefundCallbacks;
void customerCenterViewWithLegacyCallback;
void customerCenterViewWithNewCallback;
void customerCenterViewAllCallbacks;

export {
  checkPresentCustomerCenter,
  checkPresentCustomerCenterWithCallbacks,
  customerCenterCallbacks,
  presentCustomerCenterParams,
  withoutPurchaseIdCallback,
  withPurchaseIdCallback,
  testRefundCallbacks,
  customerCenterViewWithLegacyCallback,
  customerCenterViewWithNewCallback,
  customerCenterViewAllCallbacks,
};
