import React from "react";

import RevenueCatUI, {
  CustomVariableValue,
  CustomVariables,
  FooterPaywallViewOptions,
  FullScreenPaywallViewOptions,
  PAYWALL_RESULT,
  PaywallListener,
  PaywallViewOptions,
  PresentPaywallIfNeededParams,
  PresentPaywallParams,
  PurchaseResumable,
} from "../react-native-purchases-ui";
import {
  CustomerInfo,
  PurchasesError,
  PurchasesOffering,
  PurchasesOfferings,
  PurchasesPackage,
  PurchasesStoreTransaction,
} from "@revenuecat/purchases-typescript-internal";

async function checkPresentPaywall(offering: PurchasesOffering) {
  let paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall({});
  paywallResult = await RevenueCatUI.presentPaywall();
  paywallResult = await RevenueCatUI.presentPaywall({
    offering: offering,
  });
  paywallResult = await RevenueCatUI.presentPaywall({
    displayCloseButton: false,
  });
  paywallResult = await RevenueCatUI.presentPaywall({
    offering: offering,
    displayCloseButton: false,
  });
  paywallResult = await RevenueCatUI.presentPaywall({
    offering: offering,
    displayCloseButton: false,
    fontFamily: 'Ubuntu',
  });
  paywallResult = await RevenueCatUI.presentPaywall({
    customVariables: {
      player_name: CustomVariableValue.string('John'),
      level: CustomVariableValue.string('42'),
    },
  });
  paywallResult = await RevenueCatUI.presentPaywall({
    offering: offering,
    customVariables: {
      player_name: CustomVariableValue.string('John'),
    },
  });
}

async function checkPresentPaywallIfNeeded(offering: PurchasesOffering) {
  let paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywallIfNeeded(
    {
      requiredEntitlementIdentifier: "entitlement",
    }
  );
  paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: "entitlement",
    offering: offering,
  });
  paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: "entitlement",
    displayCloseButton: false,
  });
  paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: "entitlement",
    offering: offering,
    displayCloseButton: false,
  });
  paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: "entitlement",
    offering: offering,
    displayCloseButton: false,
    fontFamily: 'Ubuntu',
  });
  paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: "entitlement",
    customVariables: {
      player_name: CustomVariableValue.string('John'),
    },
  });
  paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: "entitlement",
    offering: offering,
    customVariables: {
      player_name: CustomVariableValue.string('John'),
      level: CustomVariableValue.string('42'),
    },
  });
}

function checkPresentPaywallParams(params: PresentPaywallParams) {
  const offeringIdentifier: PurchasesOffering | undefined = params.offering;
  const displayCloseButton: boolean | undefined = params.displayCloseButton;
  const customVariables: CustomVariables | undefined = params.customVariables;
}

function checkPresentPaywallIfNeededParams(params: PresentPaywallIfNeededParams) {
  const requiredEntitlementIdentifier: string =
    params.requiredEntitlementIdentifier;
  const offeringIdentifier: PurchasesOffering | undefined = params.offering;
  const displayCloseButton: boolean | undefined = params.displayCloseButton;
  const customVariables: CustomVariables | undefined = params.customVariables;
}

function checkFullScreenPaywallViewOptions(
  options: FullScreenPaywallViewOptions
) {
  const offering: PurchasesOffering | undefined | null = options.offering;
  const fontFamily: string | undefined | null = options.fontFamily;
  const displayCloseButton: boolean | undefined = options.displayCloseButton;
  const customVariables: CustomVariables | undefined = options.customVariables;
}

function checkFooterPaywallViewOptions(options: FooterPaywallViewOptions) {
  const offering: PurchasesOffering | undefined | null = options.offering;
  const fontFamily: string | undefined | null = options.fontFamily;
  const customVariables: CustomVariables | undefined = options.customVariables;
}

function checkPaywallViewOptions(options: PaywallViewOptions) {
  const offering: PurchasesOffering | undefined | null = options.offering;
  const fontFamily: string | undefined | null = options.fontFamily;
  const customVariables: CustomVariables | undefined = options.customVariables;
}

const onPurchaseStarted = ({
  packageBeingPurchased,
}: {
  packageBeingPurchased: PurchasesPackage;
}) => {};

const onPurchaseCompleted = ({
  customerInfo,
  storeTransaction,
}: {
  customerInfo: CustomerInfo;
  storeTransaction: PurchasesStoreTransaction;
}) => {};

const onPurchaseError = ({ error }: { error: PurchasesError }) => {};

const onPurchaseCancelled = () => {};

const onRestoreStarted = () => {};

const onRestoreCompleted = ({
  customerInfo,
}: {
  customerInfo: CustomerInfo;
}) => {};

const onPurchasePackageInitiated = ({
  packageBeingPurchased,
  resume,
}: {
  packageBeingPurchased: PurchasesPackage;
  resume: (shouldResume: boolean) => void;
}) => {};

const onRestoreError = ({ error }: { error: PurchasesError }) => {};

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
        offering: offering,
      }}
    />
  );
};

const PaywallScreenWithFontFamily = (fontFamily: string | undefined | null) => {
  return (
    <RevenueCatUI.Paywall
      style={{ marginBottom: 10 }}
      options={{
        fontFamily: fontFamily,
      }}
    />
  );
};

const PaywallScreenWithOfferingAndEvents = (
  offering: PurchasesOffering,
  fontFamily: string | undefined | null
) => {
  return (
    <RevenueCatUI.Paywall
      style={{ marginBottom: 10 }}
      options={{
        offering: offering,
        fontFamily: fontFamily,
      }}
      onPurchaseStarted={onPurchaseStarted}
      onPurchaseCompleted={onPurchaseCompleted}
      onPurchaseError={onPurchaseError}
      onPurchaseCancelled={onPurchaseCancelled}
      onRestoreStarted={onRestoreStarted}
      onRestoreCompleted={onRestoreCompleted}
      onRestoreError={onRestoreError}
      onDismiss={onDismiss}
      onPurchasePackageInitiated={onPurchasePackageInitiated}
    />
  );
};

const PaywallScreenNoOptions = () => {
  return <RevenueCatUI.Paywall style={{ marginBottom: 10 }} />;
};

const PaywallScreenWithCustomVariables = (offering: PurchasesOffering) => {
  return (
    <RevenueCatUI.Paywall
      style={{ marginBottom: 10 }}
      options={{
        offering: offering,
        customVariables: {
          player_name: CustomVariableValue.string('John'),
          level: CustomVariableValue.string('42'),
        },
      }}
    />
  );
};

const OriginalTemplatePaywallFooterPaywallScreen = () => {
  return (
    <RevenueCatUI.OriginalTemplatePaywallFooterContainerView
      options={{
        offering: null,
      }}
    ></RevenueCatUI.OriginalTemplatePaywallFooterContainerView>
  );
};

const FooterPaywallScreen = () => {
  return (
    <RevenueCatUI.PaywallFooterContainerView
      options={{
        offering: null,
      }}
    ></RevenueCatUI.PaywallFooterContainerView>
  );
};

const OriginalTemplateFooterPaywallScreenWithOffering = (offering: PurchasesOffering) => {
  return (
    <RevenueCatUI.OriginalTemplatePaywallFooterContainerView
      options={{
        offering: offering,
      }}
    ></RevenueCatUI.OriginalTemplatePaywallFooterContainerView>
  );
};

const FooterPaywallScreenWithOffering = (offering: PurchasesOffering) => {
  return (
    <RevenueCatUI.PaywallFooterContainerView
      options={{
        offering: offering,
      }}
    ></RevenueCatUI.PaywallFooterContainerView>
  );
};

const OriginalTemplateFooterPaywallScreenWithFontFamily = (
  fontFamily: string | null | undefined
) => {
  return (
    <RevenueCatUI.OriginalTemplatePaywallFooterContainerView
      options={{
        fontFamily: fontFamily,
      }}
    ></RevenueCatUI.OriginalTemplatePaywallFooterContainerView>
  );
};

const FooterPaywallScreenWithFontFamily = (
  fontFamily: string | null | undefined
) => {
  return (
    <RevenueCatUI.PaywallFooterContainerView
      options={{
        fontFamily: fontFamily,
      }}
    ></RevenueCatUI.PaywallFooterContainerView>
  );
};

const OriginalTemplateFooterPaywallScreenWithOfferingAndEvents = (
  offering: PurchasesOffering,
  fontFamily: string | undefined | null
) => {
  return (
    <RevenueCatUI.OriginalTemplatePaywallFooterContainerView
      options={{
        offering: offering,
        fontFamily: fontFamily,
      }}
      onPurchaseStarted={onPurchaseStarted}
      onPurchaseCompleted={onPurchaseCompleted}
      onPurchaseError={onPurchaseError}
      onPurchaseCancelled={onPurchaseCancelled}
      onRestoreStarted={onRestoreStarted}
      onRestoreCompleted={onRestoreCompleted}
      onDismiss={onDismiss}
    ></RevenueCatUI.OriginalTemplatePaywallFooterContainerView>
  );
};

const FooterPaywallScreenWithOfferingAndEvents = (
  offering: PurchasesOffering,
  fontFamily: string | undefined | null
) => {
  return (
    <RevenueCatUI.PaywallFooterContainerView
      options={{
        offering: offering,
        fontFamily: fontFamily,
      }}
      onPurchaseStarted={onPurchaseStarted}
      onPurchaseCompleted={onPurchaseCompleted}
      onPurchaseError={onPurchaseError}
      onPurchaseCancelled={onPurchaseCancelled}
      onRestoreStarted={onRestoreStarted}
      onRestoreCompleted={onRestoreCompleted}
      onDismiss={onDismiss}
    ></RevenueCatUI.PaywallFooterContainerView>
  );
};

const OriginalTemplateFooterPaywallScreenNoOptions = () => {
  return (
    <RevenueCatUI.OriginalTemplatePaywallFooterContainerView></RevenueCatUI.OriginalTemplatePaywallFooterContainerView>
  );
};

const FooterPaywallScreenNoOptions = () => {
  return (
    <RevenueCatUI.PaywallFooterContainerView></RevenueCatUI.PaywallFooterContainerView>
  );
};

// PaywallListener and PurchaseResumable type checks

function checkPaywallListener() {
  const listener: PaywallListener = {
    onPurchaseStarted: (args: { packageBeingPurchased: PurchasesPackage }) => {
      const pkg: PurchasesPackage = args.packageBeingPurchased;
    },
    onPurchaseCompleted: (args: { customerInfo: CustomerInfo; storeTransaction: PurchasesStoreTransaction }) => {
      const info: CustomerInfo = args.customerInfo;
      const txn: PurchasesStoreTransaction = args.storeTransaction;
    },
    onPurchaseError: (args: { error: PurchasesError }) => {
      const err: PurchasesError = args.error;
    },
    onPurchaseCancelled: () => {},
    onRestoreStarted: () => {},
    onRestoreCompleted: (args: { customerInfo: CustomerInfo }) => {
      const info: CustomerInfo = args.customerInfo;
    },
    onRestoreError: (args: { error: PurchasesError }) => {
      const err: PurchasesError = args.error;
    },
    onPurchaseInitiated: (args: { packageBeingPurchased: PurchasesPackage; resumable: PurchaseResumable }) => {
      const pkg: PurchasesPackage = args.packageBeingPurchased;
      const r: PurchaseResumable = args.resumable;
      args.resumable.resume();
      args.resumable.resume(true);
      args.resumable.resume(false);
    },
  };
}

const PaywallScreenWithListener = () => {
  const listener: PaywallListener = {
    onPurchaseStarted: (args: { packageBeingPurchased: PurchasesPackage }) => {},
    onPurchaseCompleted: (args: { customerInfo: CustomerInfo; storeTransaction: PurchasesStoreTransaction }) => {},
    onPurchaseError: (args: { error: PurchasesError }) => {},
    onPurchaseCancelled: () => {},
    onRestoreStarted: () => {},
    onRestoreCompleted: (args: { customerInfo: CustomerInfo }) => {},
    onRestoreError: (args: { error: PurchasesError }) => {},
    onPurchaseInitiated: (args: { packageBeingPurchased: PurchasesPackage; resumable: PurchaseResumable }) => {
      args.resumable.resume(true);
    },
  };

  return (
    <RevenueCatUI.Paywall
      style={{ marginBottom: 10 }}
      listener={listener}
    />
  );
};

const PaywallScreenWithListenerAndIndividualProps = () => {
  // Individual props should take precedence over listener
  const listener: PaywallListener = {
    onPurchaseStarted: (args: { packageBeingPurchased: PurchasesPackage }) => {},
    onPurchaseCompleted: (args: { customerInfo: CustomerInfo; storeTransaction: PurchasesStoreTransaction }) => {},
  };

  return (
    <RevenueCatUI.Paywall
      style={{ marginBottom: 10 }}
      listener={listener}
      onPurchaseStarted={onPurchaseStarted}
    />
  );
};

const FooterPaywallScreenWithListener = () => {
  const listener: PaywallListener = {
    onPurchaseStarted: (args: { packageBeingPurchased: PurchasesPackage }) => {},
    onPurchaseCompleted: (args: { customerInfo: CustomerInfo; storeTransaction: PurchasesStoreTransaction }) => {},
    onPurchaseError: (args: { error: PurchasesError }) => {},
    onPurchaseCancelled: () => {},
    onRestoreStarted: () => {},
    onRestoreCompleted: (args: { customerInfo: CustomerInfo }) => {},
    onRestoreError: (args: { error: PurchasesError }) => {},
  };

  return (
    <RevenueCatUI.OriginalTemplatePaywallFooterContainerView
      listener={listener}
    ></RevenueCatUI.OriginalTemplatePaywallFooterContainerView>
  );
};
