import React from 'react';
import RevenueCatUI from 'react-native-purchases-ui';

import { Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import RootStackParamList from '../RootStackParamList';
import {
  CustomerInfo,
  PurchasesError, PurchasesPackage,
  PurchasesStoreTransaction
} from "@revenuecat/purchases-typescript-internal";
import { useCustomVariables } from '../context/CustomVariablesContext';

type Props = NativeStackScreenProps<RootStackParamList, 'FooterPaywall'>;

const FooterPaywallScreen: React.FC<Props> = ({route, navigation}: Props) => {
  const { customVariables: globalCustomVariables } = useCustomVariables();

  // Merge route params custom variables with global ones (route params take precedence)
  const customVariables = {
    ...globalCustomVariables,
    ...route.params.customVariables,
  };
  // Example handlers for the events
  const onPurchaseCompleted = ({customerInfo, storeTransaction}: {
    customerInfo: CustomerInfo, storeTransaction: PurchasesStoreTransaction
  }) => {
    console.log('Purchase completed:', customerInfo, storeTransaction);
  };

  const onPurchaseStarted = ({packageBeingPurchased}: { packageBeingPurchased: PurchasesPackage }) => {
    console.log('Purchase started:', packageBeingPurchased);
  };

  const onPurchaseError = ({error}: { error: PurchasesError }) => {
    console.error('Purchase error:', error);
  };

  const onPurchaseCancelled = () => {
    console.log('Purchase was cancelled');
  };

  const onRestoreStarted = () => {
    console.log('Restore started');
  };

  const onRestoreCompleted = ({customerInfo}: { customerInfo: CustomerInfo }) => {
    console.log('Restore completed:', customerInfo);
  };

  const onRestoreError = ({error}: { error: PurchasesError }) => {
    console.error('Restore error:', error);
  };

  const onDismiss = () => {
    console.log('Dismissed');
    navigation.pop();
  };

  return (
    <RevenueCatUI.OriginalTemplatePaywallFooterContainerView style={{backgroundColor: '#f8f8f8'}}
                                                             options={{
                                                               offering: route.params.offering,
                                                               fontFamily: route.params.fontFamily,
                                                               customVariables: customVariables,
                                                             }}
                                                             onPurchaseStarted={onPurchaseStarted}
                                                             onPurchaseCompleted={onPurchaseCompleted}
                                                             onPurchaseError={onPurchaseError}
                                                             onPurchaseCancelled={onPurchaseCancelled}
                                                             onRestoreStarted={onRestoreStarted}
                                                             onRestoreCompleted={onRestoreCompleted}
                                                             onRestoreError={onRestoreError}
                                                             onDismiss={onDismiss}>
      <Text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec
        ligula in dolor efficitur accumsan nec vel nisl. Sed vitae lectus eget
        odio volutpat bibendum. Duis condimentum venenatis nisl, nec vulputate
        quam bibendum eu. Integer id ex non augue feugiat ullamcorper vel sit
        amet elit. Vivamus eget justo vel risus feugiat hendrerit. Suspendisse
        in varius felis. Nullam venenatis justo nec massa tempus, nec vulputate
        nisl congue. Duis rhoncus velit at sapien consectetur, et euismod purus
        rhoncus. Sed eget nisl nec lacus facilisis sagittis. Sed vel metus vel
        libero sodales rhoncus. Fusce eget magna vel justo venenatis posuere ac
        at nulla. Donec consequat elit ut ligula ultrices, vel pharetra elit
        dapibus. Morbi eu vestibulum libero. Nam fermentum neque eget felis
        tincidunt, in finibus ligula efficitur. Quisque sit amet elit nec libero
        condimentum ullamcorper. Integer auctor eros vel lacus aliquam, nec
        eleifend urna cursus. Vestibulum et leo vitae elit bibendum tristique.
        Phasellus tincidunt felis vitae felis sagittis, a euismod libero
        hendrerit. Ut at nibh vel nunc ultrices convallis. In hac habitasse
        platea dictumst. Sed vel sodales velit. Nulla tincidunt nisi id urna
        tincidunt, a fringilla neque suscipit. Vestibulum in sagittis lectus.
        Vivamus nec bibendum velit. In non odio eu ligula scelerisque accumsan.
        Duis condimentum, augue et tincidunt fringilla, dui elit vulputate
        mauris, vel fermentum justo neque nec felis. Lorem ipsum dolor sit amet,
        consectetur adipiscing elit. Proin nec ligula in dolor efficitur
        accumsan nec vel nisl. Sed vitae lectus eget odio volutpat bibendum.
        Duis condimentum venenatis nisl, nec vulputate quam bibendum eu. Integer
        id ex non augue feugiat ullamcorper vel sit amet elit. Vivamus eget
        justo vel risus feugiat hendrerit. Suspendisse in varius felis. Nullam
        venenatis justo nec massa tempus, nec vulputate nisl congue. Duis
        rhoncus velit at sapien consectetur, et euismod purus rhoncus. Sed eget
        nisl nec lacus facilisis sagittis. Sed vel metus vel libero sodales
        rhoncus. Fusce eget magna vel justo venenatis posuere ac at nulla. Donec
        consequat elit ut ligula ultrices, vel pharetra elit dapibus. Morbi eu
        vestibulum libero. Nam fermentum neque eget felis tincidunt, in finibus
        ligula efficitur. Quisque sit amet elit nec libero condimentum
        ullamcorper. Integer auctor eros vel lacus aliquam, nec eleifend urna
        cursus. Vestibulum et leo vitae elit bibendum tristique. Phasellus
        tincidunt felis vitae felis sagittis, a euismod libero hendrerit. Ut at
        nibh vel nunc ultrices convallis. In hac habitasse platea dictumst. Sed
        vel sodales velit. Nulla tincidunt nisi id urna tincidunt, a fringilla
        neque suscipit. Vestibulum in sagittis lectus. Vivamus nec bibendum
        velit. In non odio eu ligula scelerisque accumsan. Duis condimentum,
        augue et tincidunt fringilla, dui elit vulputate mauris, vel fermentum
        justo neque nec felis.
      </Text>
    </RevenueCatUI.OriginalTemplatePaywallFooterContainerView>
  );
};

export default FooterPaywallScreen;
