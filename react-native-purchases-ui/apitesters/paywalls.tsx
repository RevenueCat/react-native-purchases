import React from "react";
import type { ComponentProps } from "react";

import RevenueCatUI, {
  PAYWALL_RESULT,
  CustomVariableValue,
  FLOW_PRESENTATION_MODE,
  checkpoint,
  checkpointEmbedded,
  EmbeddedCheckpointCallbacks,
  EmbeddedCheckpointErrorRequest,
  EmbeddedCheckpointHandle,
  EmbeddedCheckpointParams,
} from "react-native-purchases-ui";
import type {
  CheckpointParams,
  CheckpointResult,
  FlowResult,
  ObtainedEntitlement,
  ObtainedProduct,
  FooterPaywallViewOptions,
  FullScreenPaywallViewOptions,
  PaywallCallbacks,
  PaywallViewOptions,
  PresentPaywallIfNeededParams,
  PresentPaywallParams,
  CustomVariables,
} from "react-native-purchases-ui";
import type {
  CustomerInfo,
  PaywallInteractionEvent,
  PurchasesError,
  PurchasesOffering,
  PurchasesPackage,
  PurchasesStoreTransaction,
} from "@revenuecat/purchases-typescript-internal";

const paywallResultEnum: typeof PAYWALL_RESULT = RevenueCatUI.PAYWALL_RESULT;

void paywallResultEnum;

const checkpointAPI = () => {
  const remove = RevenueCatUI.checkpoint('upgrade', (result: CheckpointResult) => {
    void result.customer.entitlements.active;
    result.flow?.obtainedEntitlements.forEach(value => { void value.entitlementInfo.identifier; });
    result.flow?.obtainedProducts.forEach(value => { void value.product.identifier; });
  }, {
    presentationMode: FLOW_PRESENTATION_MODE.MODAL_SHEET,
    customVariables: {level: CustomVariableValue.number(12)},
  });
  remove();
};
void checkpointAPI;

const namedCheckpointAPI = () => {
  const removeWithoutOptions: () => void = checkpoint('upgrade', (result: CheckpointResult) => {
    void result;
  });
  removeWithoutOptions();

  const params: CheckpointParams = {
    presentationMode: FLOW_PRESENTATION_MODE.DEFAULT,
    customVariables: {level: CustomVariableValue.number(12)},
  };
  const removeWithParams = checkpoint('upgrade', () => {}, params);
  removeWithParams();

  const fullScreenParams: CheckpointParams = {
    presentationMode: FLOW_PRESENTATION_MODE.MODAL_FULL_SCREEN,
  };
  checkpoint('upgrade', () => {}, fullScreenParams)();
};
void namedCheckpointAPI;

const checkpointResultTypes = (result: CheckpointResult) => {
  const flow: FlowResult | null = result.flow;
  const entitlements: ObtainedEntitlement[] | undefined = flow?.obtainedEntitlements;
  const products: ObtainedProduct[] | undefined = flow?.obtainedProducts;
  void entitlements;
  void products;
};
void checkpointResultTypes;

type PaywallComponentProps = ComponentProps<typeof RevenueCatUI.Paywall>;

const paywallComponentProps: PaywallComponentProps = {
  options: {
    offering: null,
    displayCloseButton: true,
    fontFamily: "Roboto",
    customVariables: {
      player_name: CustomVariableValue.string("John"),
      level: CustomVariableValue.string("42"),
    },
  },
  onPurchaseStarted: ({ packageBeingPurchased }) => {
    const selectedPackage: PurchasesPackage = packageBeingPurchased;
    void selectedPackage;
  },
  onPurchaseCompleted: ({ customerInfo, storeTransaction }) => {
    const info: CustomerInfo = customerInfo;
    const transaction: PurchasesStoreTransaction = storeTransaction;
    void info;
    void transaction;
  },
  onPurchaseError: ({ error }) => {
    const purchasesError: PurchasesError = error;
    void purchasesError;
  },
  onPurchaseCancelled: () => {},
  onRestoreStarted: () => {},
  onRestoreCompleted: ({ customerInfo }) => {
    const info: CustomerInfo = customerInfo;
    void info;
  },
  onRestoreError: ({ error }) => {
    const purchasesError: PurchasesError = error;
    void purchasesError;
  },
  onDismiss: () => {},
  onWebCheckoutOpened: () => {},
  onUrlOpened: (url: string) => {},
  onInteraction: (event: PaywallInteractionEvent) => {},
};

void paywallComponentProps;

type FooterComponentProps = ComponentProps<
  typeof RevenueCatUI.OriginalTemplatePaywallFooterContainerView
>;

const footerComponentProps: FooterComponentProps = {
  options: {
    offering: null,
    fontFamily: "Roboto",
    customVariables: {
      player_name: CustomVariableValue.string("John"),
    },
  },
  onPurchaseStarted: ({ packageBeingPurchased }) => {
    const selectedPackage: PurchasesPackage = packageBeingPurchased;
    void selectedPackage;
  },
  onPurchaseCompleted: ({ customerInfo, storeTransaction }) => {
    const info: CustomerInfo = customerInfo;
    const transaction: PurchasesStoreTransaction = storeTransaction;
    void info;
    void transaction;
  },
  onPurchaseError: ({ error }) => {
    const purchasesError: PurchasesError = error;
    void purchasesError;
  },
  onPurchaseCancelled: () => {},
  onRestoreStarted: () => {},
  onRestoreCompleted: ({ customerInfo }) => {
    const info: CustomerInfo = customerInfo;
    void info;
  },
  onRestoreError: ({ error }) => {
    const purchasesError: PurchasesError = error;
    void purchasesError;
  },
  onDismiss: () => {},
};

void footerComponentProps;

type DeprecatedFooterComponentProps = ComponentProps<
  typeof RevenueCatUI.PaywallFooterContainerView
>;

const deprecatedFooterComponentProps: DeprecatedFooterComponentProps = {
  options: {
    offering: null,
    fontFamily: "Arial",
  },
  onPurchaseStarted: ({ packageBeingPurchased }) => {
    const selectedPackage: PurchasesPackage = packageBeingPurchased;
    void selectedPackage;
  },
  onPurchaseCompleted: ({ customerInfo, storeTransaction }) => {
    const info: CustomerInfo = customerInfo;
    const transaction: PurchasesStoreTransaction = storeTransaction;
    void info;
    void transaction;
  },
  onPurchaseError: ({ error }) => {
    const purchasesError: PurchasesError = error;
    void purchasesError;
  },
  onPurchaseCancelled: () => {},
  onRestoreStarted: () => {},
  onRestoreCompleted: ({ customerInfo }) => {
    const info: CustomerInfo = customerInfo;
    void info;
  },
  onRestoreError: ({ error }) => {
    const purchasesError: PurchasesError = error;
    void purchasesError;
  },
  onDismiss: () => {},
};

void deprecatedFooterComponentProps;

async function checkPresentPaywall(offering: PurchasesOffering) {
  let paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();
  paywallResult = await RevenueCatUI.presentPaywall({});
  paywallResult = await RevenueCatUI.presentPaywall({
    offering,
  });
  paywallResult = await RevenueCatUI.presentPaywall({
    displayCloseButton: false,
  });
  paywallResult = await RevenueCatUI.presentPaywall({
    offering,
    displayCloseButton: false,
  });
  paywallResult = await RevenueCatUI.presentPaywall({
    offering,
    displayCloseButton: false,
    fontFamily: "Ubuntu",
  });
  paywallResult = await RevenueCatUI.presentPaywall({
    customVariables: {
      player_name: CustomVariableValue.string("John"),
      level: CustomVariableValue.string("5"),
    },
  });
  paywallResult = await RevenueCatUI.presentPaywall({
    offering,
    customVariables: {
      player_name: CustomVariableValue.string("John"),
    },
  });
}

async function checkPresentPaywallIfNeeded(offering: PurchasesOffering) {
  let paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: "pro_access",
  });
  paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: "pro_access",
    offering,
  });
  paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: "pro_access",
    displayCloseButton: false,
  });
  paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: "pro_access",
    offering,
    displayCloseButton: false,
  });
  paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: "pro_access",
    offering,
    displayCloseButton: false,
    fontFamily: "Ubuntu",
  });
  paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: "pro_access",
    customVariables: {
      player_name: CustomVariableValue.string("John"),
    },
  });
  paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: "pro_access",
    offering,
    customVariables: {
      player_name: CustomVariableValue.string("John"),
      level: CustomVariableValue.string("5"),
    },
  });
}

async function checkPresentPaywallWithCallbacks(callbacks: PaywallCallbacks) {
  let paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall({ callbacks });
  paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: "entitlement",
    callbacks,
  });
  void paywallResult;
}

const paywallCallbacks: PaywallCallbacks = {
  onPurchaseStarted: ({ packageBeingPurchased }) => {
    const purchasedPackage: PurchasesPackage = packageBeingPurchased;
    void purchasedPackage;
  },
  onPurchaseCompleted: ({ customerInfo, storeTransaction }) => {
    const info: CustomerInfo = customerInfo;
    const transaction: PurchasesStoreTransaction = storeTransaction;
    void info;
    void transaction;
  },
  onPurchaseError: ({ error }) => {
    const purchasesError: PurchasesError = error;
    void purchasesError;
  },
  onPurchaseCancelled: () => {},
  onRestoreStarted: () => {},
  onRestoreCompleted: ({ customerInfo }) => {
    const info: CustomerInfo = customerInfo;
    void info;
  },
  onRestoreError: ({ error }) => {
    const purchasesError: PurchasesError = error;
    void purchasesError;
  },
  onPurchasePackageInitiated: ({ packageBeingPurchased, resume }) => {
    const purchasedPackage: PurchasesPackage = packageBeingPurchased;
    void purchasedPackage;
    resume(true);
  },
  onWebCheckoutOpened: () => {},
  onUrlOpened: (url) => {
    const opened: string = url;
    void opened;
  },
  onInteraction: (event) => {
    const interaction: PaywallInteractionEvent = event;
    void interaction;
  },
};

function checkPresentPaywallParams(params: PresentPaywallParams) {
  const offering: PurchasesOffering | undefined = params.offering;
  const displayCloseButton: boolean | undefined = params.displayCloseButton;
  const fontFamily: string | null | undefined = params.fontFamily;
  const customVariables: CustomVariables | undefined = params.customVariables;
  const callbacks: PaywallCallbacks | undefined = params.callbacks;

  void offering;
  void displayCloseButton;
  void fontFamily;
  void customVariables;
  void callbacks;
}

function checkPresentPaywallIfNeededParams(params: PresentPaywallIfNeededParams) {
  const offering: PurchasesOffering | undefined = params.offering;
  const displayCloseButton: boolean | undefined = params.displayCloseButton;
  const fontFamily: string | null | undefined = params.fontFamily;
  const entitlement: string = params.requiredEntitlementIdentifier;
  const customVariables: CustomVariables | undefined = params.customVariables;

  void offering;
  void displayCloseButton;
  void fontFamily;
  void entitlement;
  void customVariables;
}

function checkFullScreenPaywallViewOptions(
  options: FullScreenPaywallViewOptions,
) {
  const offering: PurchasesOffering | null | undefined = options.offering;
  const fontFamily: string | null | undefined = options.fontFamily;
  const displayCloseButton: boolean | undefined = options.displayCloseButton;

  void offering;
  void fontFamily;
  void displayCloseButton;
}

function checkFooterPaywallViewOptions(options: FooterPaywallViewOptions) {
  const offering: PurchasesOffering | null | undefined = options.offering;
  const fontFamily: string | null | undefined = options.fontFamily;

  void offering;
  void fontFamily;
}

function checkPaywallViewOptions(options: PaywallViewOptions) {
  const offering: PurchasesOffering | null | undefined = options.offering;
  const fontFamily: string | null | undefined = options.fontFamily;
  const customVariables: CustomVariables | undefined = options.customVariables;

  void offering;
  void fontFamily;
  void customVariables;
}

const onPurchaseStarted = ({
  packageBeingPurchased,
}: {
  packageBeingPurchased: PurchasesPackage;
}) => {
  const selectedPackage: PurchasesPackage = packageBeingPurchased;
  void selectedPackage;
};

const onPurchaseCompleted = ({
  customerInfo,
  storeTransaction,
}: {
  customerInfo: CustomerInfo;
  storeTransaction: PurchasesStoreTransaction;
}) => {
  const info: CustomerInfo = customerInfo;
  const transaction: PurchasesStoreTransaction = storeTransaction;
  void info;
  void transaction;
};

const onPurchaseError = ({ error }: { error: PurchasesError }) => {
  const purchasesError: PurchasesError = error;
  void purchasesError;
};

const onPurchaseCancelled = () => {};

const onRestoreStarted = () => {};

const onRestoreCompleted = ({
  customerInfo,
}: {
  customerInfo: CustomerInfo;
}) => {
  const info: CustomerInfo = customerInfo;
  void info;
};

const onRestoreError = ({ error }: { error: PurchasesError }) => {
  const purchasesError: PurchasesError = error;
  void purchasesError;
};

const onDismiss = () => {};

const onWebCheckoutOpened = () => {};
const onUrlOpened = (url: string) => {};
const onInteraction = (event: PaywallInteractionEvent) => {};

const PaywallScreen = () => {
  return (
    <RevenueCatUI.Paywall
      style={{ marginBottom: 10 }}
      options={{
        offering: null,
      }}
    />
  );
};

const PaywallScreenWithOffering = (offering: PurchasesOffering) => {
  return (
    <RevenueCatUI.Paywall
      style={{ marginBottom: 10 }}
      options={{
        offering,
      }}
    />
  );
};

const PaywallScreenWithFontFamily = (fontFamily: string | null | undefined) => {
  return (
    <RevenueCatUI.Paywall
      style={{ marginBottom: 10 }}
      options={{
        fontFamily,
      }}
    />
  );
};

const PaywallScreenWithOfferingAndEvents = (
  offering: PurchasesOffering,
  fontFamily: string | null | undefined,
) => {
  return (
    <RevenueCatUI.Paywall
      style={{ marginBottom: 10 }}
      options={{
        offering,
        fontFamily,
      }}
      onPurchaseStarted={onPurchaseStarted}
      onPurchaseCompleted={onPurchaseCompleted}
      onPurchaseError={onPurchaseError}
      onPurchaseCancelled={onPurchaseCancelled}
      onRestoreStarted={onRestoreStarted}
      onRestoreCompleted={onRestoreCompleted}
      onRestoreError={onRestoreError}
      onDismiss={onDismiss}
      onWebCheckoutOpened={onWebCheckoutOpened}
      onUrlOpened={onUrlOpened}
      onInteraction={onInteraction}
    />
  );
};

const PaywallScreenWithCustomVariables = (offering: PurchasesOffering) => {
  return (
    <RevenueCatUI.Paywall
      style={{ marginBottom: 10 }}
      options={{
        offering,
        customVariables: {
          player_name: CustomVariableValue.string("John"),
          level: CustomVariableValue.string("42"),
        },
      }}
    />
  );
};

const PaywallScreenNoOptions = () => {
  return <RevenueCatUI.Paywall style={{ marginBottom: 10 }} />;
};

const OriginalTemplatePaywallFooterPaywallScreen = () => {
  return (
    <RevenueCatUI.OriginalTemplatePaywallFooterContainerView
      options={{
        offering: null,
      }}
    />
  );
};

const FooterPaywallScreen = () => {
  return (
    <RevenueCatUI.PaywallFooterContainerView
      options={{
        offering: null,
      }}
    />
  );
};

const OriginalTemplateFooterPaywallScreenWithOffering = (
  offering: PurchasesOffering,
) => {
  return (
    <RevenueCatUI.OriginalTemplatePaywallFooterContainerView
      options={{
        offering,
      }}
    />
  );
};

const FooterPaywallScreenWithOffering = (offering: PurchasesOffering) => {
  return (
    <RevenueCatUI.PaywallFooterContainerView
      options={{
        offering,
      }}
    />
  );
};

const OriginalTemplateFooterPaywallScreenWithFontFamily = (
  fontFamily: string | null | undefined,
) => {
  return (
    <RevenueCatUI.OriginalTemplatePaywallFooterContainerView
      options={{
        fontFamily,
      }}
    />
  );
};

const FooterPaywallScreenWithFontFamily = (
  fontFamily: string | null | undefined,
) => {
  return (
    <RevenueCatUI.PaywallFooterContainerView
      options={{
        fontFamily,
      }}
    />
  );
};

const OriginalTemplateFooterPaywallScreenWithOfferingAndEvents = (
  offering: PurchasesOffering,
  fontFamily: string | null | undefined,
) => {
  return (
    <RevenueCatUI.OriginalTemplatePaywallFooterContainerView
      options={{
        offering,
        fontFamily,
      }}
      onPurchaseStarted={onPurchaseStarted}
      onPurchaseCompleted={onPurchaseCompleted}
      onPurchaseError={onPurchaseError}
      onPurchaseCancelled={onPurchaseCancelled}
      onRestoreStarted={onRestoreStarted}
      onRestoreCompleted={onRestoreCompleted}
      onRestoreError={onRestoreError}
      onDismiss={onDismiss}
    />
  );
};

const FooterPaywallScreenWithOfferingAndEvents = (
  offering: PurchasesOffering,
  fontFamily: string | null | undefined,
) => {
  return (
    <RevenueCatUI.PaywallFooterContainerView
      options={{
        offering,
        fontFamily,
      }}
      onPurchaseStarted={onPurchaseStarted}
      onPurchaseCompleted={onPurchaseCompleted}
      onPurchaseError={onPurchaseError}
      onPurchaseCancelled={onPurchaseCancelled}
      onRestoreStarted={onRestoreStarted}
      onRestoreCompleted={onRestoreCompleted}
      onRestoreError={onRestoreError}
      onDismiss={onDismiss}
    />
  );
};

const OriginalTemplateFooterPaywallScreenNoOptions = () => {
  return <RevenueCatUI.OriginalTemplatePaywallFooterContainerView />;
};

const FooterPaywallScreenNoOptions = () => {
  return <RevenueCatUI.PaywallFooterContainerView />;
};

export {
  checkPresentPaywallWithCallbacks,
  paywallCallbacks,
  FooterPaywallScreen,
  FooterPaywallScreenNoOptions,
  FooterPaywallScreenWithFontFamily,
  FooterPaywallScreenWithOffering,
  FooterPaywallScreenWithOfferingAndEvents,
  OriginalTemplateFooterPaywallScreenNoOptions,
  OriginalTemplateFooterPaywallScreenWithFontFamily,
  OriginalTemplateFooterPaywallScreenWithOffering,
  OriginalTemplateFooterPaywallScreenWithOfferingAndEvents,
  OriginalTemplatePaywallFooterPaywallScreen,
  PaywallScreen,
  PaywallScreenNoOptions,
  PaywallScreenWithCustomVariables,
  PaywallScreenWithFontFamily,
  PaywallScreenWithOffering,
  PaywallScreenWithOfferingAndEvents,
};

const embeddedCheckpointAPI = () => {
  const callbacks: EmbeddedCheckpointCallbacks = {
    onPassed: (result: CheckpointResult) => {
      const flow: CheckpointResult['flow'] = result.flow;
      void flow;
    },
    onError: (request: EmbeddedCheckpointErrorRequest) => {
      const requestId: string = request.requestId;
      const kind: 'flowCouldNotBeShown' | 'flowActionFailed' | 'flowResultSyncFailed' = request.kind;
      const message: string = request.error.message;
      void requestId; void kind; void message;
      request.complete();
    },
    onFinished: () => {},
  };
  const params: EmbeddedCheckpointParams = { customVariables: { source: CustomVariableValue.string('api') } };
  const handle: EmbeddedCheckpointHandle = checkpointEmbedded('upgrade', callbacks, params);
  const staticHandle: EmbeddedCheckpointHandle = RevenueCatUI.checkpointEmbedded('upgrade', callbacks);
  handle.cancel();
  staticHandle.cancel();
};
void embeddedCheckpointAPI;
