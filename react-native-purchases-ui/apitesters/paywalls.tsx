import React from "react";
import type { ComponentProps } from "react";

import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import type {
  FooterPaywallViewOptions,
  FullScreenPaywallViewOptions,
  PaywallViewOptions,
  PresentPaywallIfNeededParams,
  PresentPaywallParams,
} from "react-native-purchases-ui";
import type {
  CustomerInfo,
  PurchasesError,
  PurchasesOffering,
  PurchasesPackage,
  PurchasesStoreTransaction,
} from "@revenuecat/purchases-typescript-internal";

const paywallResultEnum: typeof PAYWALL_RESULT = RevenueCatUI.PAYWALL_RESULT;

void paywallResultEnum;

type PaywallComponentProps = ComponentProps<typeof RevenueCatUI.Paywall>;

const paywallComponentProps: PaywallComponentProps = {
  options: {
    offering: null,
    displayCloseButton: true,
    fontFamily: "Roboto",
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

void paywallComponentProps;

type FooterComponentProps = ComponentProps<
  typeof RevenueCatUI.OriginalTemplatePaywallFooterContainerView
>;

const footerComponentProps: FooterComponentProps = {
  options: {
    offering: null,
    fontFamily: "Roboto",
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
}

function checkPresentPaywallParams(params: PresentPaywallParams) {
  const offering: PurchasesOffering | undefined = params.offering;
  const displayCloseButton: boolean | undefined = params.displayCloseButton;
  const fontFamily: string | null | undefined = params.fontFamily;

  void offering;
  void displayCloseButton;
  void fontFamily;
}

function checkPresentPaywallIfNeededParams(params: PresentPaywallIfNeededParams) {
  const offering: PurchasesOffering | undefined = params.offering;
  const displayCloseButton: boolean | undefined = params.displayCloseButton;
  const fontFamily: string | null | undefined = params.fontFamily;
  const entitlement: string = params.requiredEntitlementIdentifier;

  void offering;
  void displayCloseButton;
  void fontFamily;
  void entitlement;
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

  void offering;
  void fontFamily;
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
  PaywallScreenWithFontFamily,
  PaywallScreenWithOffering,
  PaywallScreenWithOfferingAndEvents,
};
