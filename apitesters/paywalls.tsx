import React from "react";

import RevenueCatUI, {
  CustomVariableValue,
  CustomVariables,
  FooterPaywallViewOptions,
  FullScreenPaywallViewOptions,
  PAYWALL_RESULT,
  PURCHASE_LOGIC_RESULT,
  PaywallViewOptions,
  PresentPaywallIfNeededParams,
  PresentPaywallParams,
} from "../react-native-purchases-ui";
import type {
  PaywallListener,
  PurchaseLogic,
  PurchaseLogicResult,
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
  const listener: PaywallListener | undefined = params.listener;
  const purchaseLogic: PurchaseLogic | undefined = params.purchaseLogic;
}

function checkPresentPaywallIfNeededParams(params: PresentPaywallIfNeededParams) {
  const requiredEntitlementIdentifier: string =
    params.requiredEntitlementIdentifier;
  const offeringIdentifier: PurchasesOffering | undefined = params.offering;
  const displayCloseButton: boolean | undefined = params.displayCloseButton;
  const customVariables: CustomVariables | undefined = params.customVariables;
  const listener: PaywallListener | undefined = params.listener;
  const purchaseLogic: PurchaseLogic | undefined = params.purchaseLogic;
}

async function checkPresentPaywallWithListener(offering: PurchasesOffering) {
  const listener: PaywallListener = {
    onPurchaseStarted: ({ packageBeingPurchased }) => {
      const pkg: PurchasesPackage = packageBeingPurchased;
    },
    onPurchaseCompleted: ({ customerInfo, storeTransaction }) => {
      const info: CustomerInfo = customerInfo;
      const txn: PurchasesStoreTransaction = storeTransaction;
    },
    onPurchaseError: ({ error }) => {
      const err: PurchasesError = error;
    },
    onPurchaseCancelled: () => {},
    onRestoreStarted: () => {},
    onRestoreCompleted: ({ customerInfo }) => {
      const info: CustomerInfo = customerInfo;
    },
    onRestoreError: ({ error }) => {
      const err: PurchasesError = error;
    },
    onPurchaseInitiated: ({ packageBeingPurchased, resumable }) => {
      const pkg: PurchasesPackage = packageBeingPurchased;
      const res: PurchaseResumable = resumable;
      resumable.resume(true);
      resumable.resume(false);
      resumable.resume();
    },
  };

  let paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall({
    listener,
  });
  paywallResult = await RevenueCatUI.presentPaywall({
    offering,
    listener,
  });
  paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: "entitlement",
    listener,
  });
}

async function checkPresentPaywallWithPurchaseLogic(offering: PurchasesOffering) {
  const purchaseLogic: PurchaseLogic = {
    performPurchase: async ({ packageToPurchase }) => {
      const pkg: PurchasesPackage = packageToPurchase;
      const successResult: PurchaseLogicResult = { result: PURCHASE_LOGIC_RESULT.SUCCESS };
      const cancelResult: PurchaseLogicResult = { result: PURCHASE_LOGIC_RESULT.CANCELLATION };
      const errorResult: PurchaseLogicResult = { result: PURCHASE_LOGIC_RESULT.ERROR, error: { code: "1", message: "test" } as PurchasesError };
      return successResult;
    },
    performRestore: async () => {
      return { result: PURCHASE_LOGIC_RESULT.SUCCESS };
    },
  };

  let paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall({
    purchaseLogic,
  });
  paywallResult = await RevenueCatUI.presentPaywall({
    offering,
    purchaseLogic,
  });
  paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: "entitlement",
    purchaseLogic,
  });
}

async function checkPresentPaywallWithBoth(offering: PurchasesOffering) {
  const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall({
    offering,
    listener: {
      onPurchaseStarted: () => {},
    },
    purchaseLogic: {
      performPurchase: async () => ({ result: PURCHASE_LOGIC_RESULT.SUCCESS }),
      performRestore: async () => ({ result: PURCHASE_LOGIC_RESULT.SUCCESS }),
    },
  });
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
