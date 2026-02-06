import { CustomerInfo, PurchasesOffering } from 'react-native-purchases';

type RootStackParamList = {
  Home: undefined;
  CustomerInfo: {appUserID: String | null, customerInfo: CustomerInfo | null};
  OfferingDetail: {offering: PurchasesOffering | null};
  WinBackTesting: {};
  VirtualCurrency: {};
  Paywall: {
    offering: PurchasesOffering | null;
    fontFamily?: string | null;
    customVariables?: { [key: string]: string };
  };
  PaywallModalNoHeader: {};
  PaywallModalWithHeader: {};
  FooterPaywall: {
    offering: PurchasesOffering | null;
    fontFamily?: string | null;
    customVariables?: { [key: string]: string };
  };
  CustomerCenterScreen: { shouldShowCloseButton?: boolean };
};

export default RootStackParamList;
