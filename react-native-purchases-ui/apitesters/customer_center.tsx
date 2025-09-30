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
  onRefundRequestStarted: ({ productIdentifier }) => {
    const identifier: string = productIdentifier;
    void identifier;
  },
  onRefundRequestCompleted: ({ productIdentifier, refundRequestStatus }) => {
    const identifier: string = productIdentifier;
    const status: REFUND_REQUEST_STATUS = refundRequestStatus;
    void identifier;
    void status;
  },
  onManagementOptionSelected: (event) => {
    const managementOptionEvent: CustomerCenterManagementOptionEvent = event;
    handleManagementOptionEvent(managementOptionEvent);
  },
  onCustomActionSelected: ({ actionId }) => {
    const id: string = actionId;
    void id;
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
    onCustomActionSelected={({ actionId }) => {
      const id: string = actionId;
      void id;
    }}
    style={{ flex: 1 }}
  />
);

type CustomerCenterViewProps = ComponentProps<typeof RevenueCatUI.CustomerCenterView>;

const customerCenterViewProps: CustomerCenterViewProps = {
  onDismiss: () => {},
  onCustomActionSelected: ({ actionId }) => {
    const id: string = actionId;
    void id;
  },
  shouldShowCloseButton: true,
  style: { flex: 1 },
};

void customerCenterViewProps;

const presentCustomerCenterParams: PresentCustomerCenterParams = {
  callbacks: customerCenterCallbacks,
};

void customerCenterElement;
void presentCustomerCenterParams;

export {
  checkPresentCustomerCenter,
  checkPresentCustomerCenterWithCallbacks,
  customerCenterCallbacks,
  presentCustomerCenterParams,
};
