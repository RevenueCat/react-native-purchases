import React, { useLayoutEffect, useEffect, useState } from 'react';
import RevenueCatUI from 'react-native-purchases-ui';
import { StyleSheet, View, StatusBar, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Required for Android navigation hiding
import { useNavigation } from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerCenter'>;

const CustomerCenterScreen: React.FC<Props> = ({ navigation }) => {
    const onDismiss = () => {
        console.log('CustomerCenter dismissed');
        navigation.goBack();
    };

      const [isMounted, setIsMounted] = useState(false);

      useEffect(() => {
        setIsMounted(true);
      }, []);

    return (
        <View style={styles.fullscreen}>
            {isMounted &&  <RevenueCatUI.CustomerCenterView
                style={styles.customerCenter}
                onDismiss={onDismiss}
            /> }
        </View>
    );
};

const styles = StyleSheet.create({
    fullscreen: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
    },
    customerCenter: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
});

export default CustomerCenterScreen;
