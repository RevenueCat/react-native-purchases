import { CustomerInfo, PurchasesOffering } from 'react-native-purchases';

type RootStackParamList = {
  Home: undefined;
  CustomerInfo: {appUserID: String | null, customerInfo: CustomerInfo | null};
  OfferingDetail: {offering: PurchasesOffering | null};
  WinBackTesting: {};
  Paywall: {offering: PurchasesOffering | null; fontFamily?: string | null};
  FooterPaywall: {
    offering: PurchasesOffering | null;
    fontFamily?: string | null;
  };
  CustomerCenterScreen: undefined;
};

export default RootStackParamList;
