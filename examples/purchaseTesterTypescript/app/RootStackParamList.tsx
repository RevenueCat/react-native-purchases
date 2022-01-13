import { PurchaserInfo, PurchasesOffering } from 'react-native-purchases';

type RootStackParamList = {
  Home: undefined;
  CustomerInfo: {appUserID: String | null, purchaserInfo: PurchaserInfo | null};
  OfferingDetail: {offering: PurchasesOffering | null};
};

export default RootStackParamList;