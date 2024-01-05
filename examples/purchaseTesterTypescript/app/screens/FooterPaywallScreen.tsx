import React from 'react';
import { PaywallFooterView } from 'react-native-purchases-ui';

import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import RootStackParamList from '../RootStackParamList';

type Props = NativeStackScreenProps<RootStackParamList, 'FooterPaywall'>;

const FooterPaywallScreen: React.FC<Props> = () => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: '#ecf0f1',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <PaywallFooterView>
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
      </PaywallFooterView>
    </SafeAreaView>
  );
};

export default FooterPaywallScreen;
