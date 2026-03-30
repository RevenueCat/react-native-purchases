import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'TestCases'>;

export default function TestCasesScreen({navigation}: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('PurchaseThroughPaywall')}
        accessibilityLabel="Purchase through paywall">
        <Text style={styles.buttonText}>Purchase through paywall</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16},
  button: {
    padding: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginVertical: 4,
  },
  buttonText: {color: 'white', fontSize: 16},
});
