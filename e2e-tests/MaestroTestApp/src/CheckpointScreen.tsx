import React, {useEffect, useRef, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import RevenueCatUI, {CheckpointResult} from 'react-native-purchases-ui';

// Presents its paywall to every user, with the monthly package preselected.
const CHECKPOINT_IDENTIFIER = 'donottouch_sdk_everyone';
const ENTITLEMENT_ID = 'pro';
const PRODUCT_ID = 'pro_monthly_subscription';

const listOrNone = (values: string[]) =>
  values.length > 0 ? values.sort().join(', ') : 'none';

const describe = (result: CheckpointResult) => {
  if (!result.flow) {
    return 'Callback: passed, no flow';
  }
  const entitlements = result.flow.obtainedEntitlements.map(
    value => value.entitlementInfo.identifier,
  );
  return `Callback: passed, entitlements: ${listOrNone(entitlements)}`;
};

// One line per fact, without regex specials, so Maestro matches each literally.
const details = (result: CheckpointResult) => {
  const products = result.flow?.obtainedProducts ?? [];
  const product = products.find(value => value.product.identifier === PRODUCT_ID);
  const entitlementObtained = (result.flow?.obtainedEntitlements ?? []).some(
    value => value.entitlementInfo.identifier === ENTITLEMENT_ID,
  );
  return [
    `Obtained products: ${listOrNone(products.map(value => value.product.identifier))}`,
    `Entitlement ${ENTITLEMENT_ID} obtained: ${entitlementObtained}`,
    `Product ${PRODUCT_ID} obtained: ${product !== undefined}`,
    `Customer active entitlements: ${listOrNone(
      Object.keys(result.customer.entitlements.active),
    )}`,
  ];
};

export default function CheckpointScreen() {
  const [status, setStatus] = useState('Callback: not invoked');
  const [lines, setLines] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const invocations = useRef(0);
  const removeCallback = useRef<(() => void) | null>(null);

  useEffect(() => () => removeCallback.current?.(), []);

  const hitCheckpoint = () => {
    setError(null);
    try {
      removeCallback.current = RevenueCatUI.checkpoint(
        CHECKPOINT_IDENTIFIER,
        result => {
          invocations.current += 1;
          setStatus(`${describe(result)} (call #${invocations.current})`);
          setLines(details(result));
        },
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error('Failed to hit checkpoint:', message);
      setError(message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Identifier: {CHECKPOINT_IDENTIFIER}</Text>
      {error && (
        <Text testID="error-message" style={styles.error}>
          Error: {error}
        </Text>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={hitCheckpoint}
        testID="hit-checkpoint-button">
        <Text style={styles.buttonText}>Hit checkpoint</Text>
      </TouchableOpacity>
      <Text testID="checkpoint-status" style={styles.status}>
        {status}
      </Text>
      {lines.map(line => (
        <Text key={line}>{line}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {fontSize: 18, marginBottom: 20},
  error: {fontSize: 14, color: 'red', marginBottom: 20, textAlign: 'center'},
  button: {padding: 16, backgroundColor: '#007AFF', borderRadius: 8},
  buttonText: {color: 'white', fontSize: 16},
  status: {fontSize: 16, marginVertical: 20, textAlign: 'center'},
});
