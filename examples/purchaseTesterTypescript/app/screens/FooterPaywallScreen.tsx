import React from 'react';
import { PaywallFooterView } from 'react-native-purchases-ui';

import { Text, View } from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import RootStackParamList from "../RootStackParamList";

type Props = NativeStackScreenProps<RootStackParamList, 'FooterPaywall'>;

const FooterPaywallScreen: React.FC<Props> = () => {
  return (
    <View style={{
      justifyContent: 'space-between',
      flexDirection: 'column',
      flexGrow: 1,
      backgroundColor: '#4b72f6',
    }}>
      <View style={{ backgroundColor: '#ff0000'}}>
        <Text>Top</Text>
      </View>
      <PaywallFooterView/>
    </View>
  );
};

export default FooterPaywallScreen;
