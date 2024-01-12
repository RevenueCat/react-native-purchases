import { CustomerInfo, PurchasesOffering } from 'react-native-purchases';

type RootStackParamList = {
  Home: undefined;
  CustomerInfo: {appUserID: String | null, customerInfo: CustomerInfo | null};
  OfferingDetail: {offering: PurchasesOffering | null};
  Paywall: undefined;
  FooterPaywall: undefined;
};

export default RootStackParamList;
