import { CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import { CustomVariables } from 'react-native-purchases-ui';

type RootStackParamList = {
  Home: undefined;
  CustomerInfo: {appUserID: String | null, customerInfo: CustomerInfo | null};
  OfferingDetail: {offering: PurchasesOffering | null};
  WinBackTesting: {};
  VirtualCurrency: {};
  Paywall: {
    offering: PurchasesOffering | null;
    fontFamily?: string | null;
    customVariables?: CustomVariables;
  };
  PaywallModalNoHeader: {};
  PaywallModalWithHeader: {};
  FooterPaywall: {
    offering: PurchasesOffering | null;
    fontFamily?: string | null;
    customVariables?: CustomVariables;
  };
  CustomerCenterScreen: { shouldShowCloseButton?: boolean };
};

export default RootStackParamList;
