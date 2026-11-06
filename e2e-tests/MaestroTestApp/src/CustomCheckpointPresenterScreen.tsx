import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Purchases from 'react-native-purchases';
import RevenueCatUI, {
  CustomVariableValue,
  FLOW_PRESENTATION_MODE,
  PAYWALL_PRESENTATION_RESULT,
} from 'react-native-purchases-ui';
import type {
  CheckpointResult,
  PaywallPresentationParams,
  PaywallPresenter,
} from 'react-native-purchases-ui';

const CHECKPOINT_IDENTIFIER = 'donottouch_sdk_everyone';
const PRODUCT_ID = 'pro_monthly_subscription';

type Presentation = {
  params: PaywallPresentationParams;
  complete: (result: PAYWALL_PRESENTATION_RESULT) => void;
};

type OwnerProps = {
  ownerId: number;
  presenter: PaywallPresenter;
  disabled: boolean;
  onPassed: (ownerId: number, result: CheckpointResult) => void;
  onError: (message: string | null) => void;
};

// This child owns the subscription. Its parent owns the app's paywall, so cleanup
// can really unmount this component while leaving an active presentation open.
function CheckpointOwner({ownerId, presenter, disabled, onPassed, onError}: OwnerProps) {
  const remove = useRef<(() => void) | null>(null);
  useEffect(() => () => remove.current?.(), []);

  const hitCheckpoint = () => {
    remove.current?.();
    onError(null);
    try {
      remove.current = RevenueCatUI.checkpoint(
        CHECKPOINT_IDENTIFIER,
        result => onPassed(ownerId, result),
        {
          paywallPresenter: presenter,
          presentationMode: FLOW_PRESENTATION_MODE.MODAL_FULL_SCREEN,
          customVariables: {
            name: CustomVariableValue.string('Maestro'),
            level: CustomVariableValue.number(42),
            premium: CustomVariableValue.boolean(true),
          },
        },
      );
    } catch (error) {
      onError(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <TestButton
      title="Hit custom checkpoint"
      testID="hit-custom-checkpoint-button"
      disabled={disabled}
      onPress={hitCheckpoint}
    />
  );
}

export default function CustomCheckpointPresenterScreen() {
  const [ownerId, setOwnerId] = useState<number | null>(1);
  const activeOwnerId = useRef<number | null>(1);
  const nextOwnerId = useRef(1);
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const awaitingCompletion = useRef(false);
  const pendingCompletion = useRef<{
    presentation: Presentation;
    result: PAYWALL_PRESENTATION_RESULT;
  } | null>(null);
  const [presentationCount, setPresentationCount] = useState(0);
  const [callbackCount, setCallbackCount] = useState(0);
  const [earlyCallbacks, setEarlyCallbacks] = useState(0);
  const [staleCallbacks, setStaleCallbacks] = useState(0);
  const [completionCount, setCompletionCount] = useState(0);
  const [lastCompletion, setLastCompletion] = useState('none');
  const [entitlements, setEntitlements] = useState('none');
  const [purchaseStatus, setPurchaseStatus] = useState('not started');
  const [error, setError] = useState<string | null>(null);

  const presenter: PaywallPresenter = useCallback((params, complete) => {
    awaitingCompletion.current = true;
    setPresentationCount(count => count + 1);
    setPurchaseStatus('not started');
    setPresentation({params, complete});
  }, []);

  const onPassed = useCallback((fromOwnerId: number, result: CheckpointResult) => {
    // Observe every callback, including stale ones. A mounted guard here would
    // conceal a leak in the SDK's cleanup instead of detecting it.
    setCallbackCount(count => count + 1);
    if (awaitingCompletion.current) {
      setEarlyCallbacks(count => count + 1);
    }
    if (fromOwnerId !== activeOwnerId.current) {
      setStaleCallbacks(count => count + 1);
    }
    setEntitlements(Object.keys(result.customer.entitlements.active).sort().join(', ') || 'none');
  }, []);

  useEffect(() => {
    if (presentation !== null || pendingCompletion.current === null) {
      return;
    }
    const pending = pendingCompletion.current;
    pendingCompletion.current = null;
    // The custom UI has been removed by this React commit. Only now report its
    // result to native, which may synchronize purchases before passing the gate.
    awaitingCompletion.current = false;
    pending.presentation.complete(pending.result);
    setCompletionCount(count => count + 1);
    setLastCompletion(pending.result);
  }, [presentation]);

  const finishPresentation = (result: PAYWALL_PRESENTATION_RESULT) => {
    if (presentation === null) {
      return;
    }
    pendingCompletion.current = {presentation, result};
    setPresentation(null);
  };

  const monthlyPackage = presentation?.params.offering.availablePackages.find(
    item => item.product.identifier === PRODUCT_ID,
  );
  const purchase = async () => {
    if (!monthlyPackage) {
      return;
    }
    setPurchaseStatus('in progress');
    setError(null);
    try {
      // Purchase the package supplied by the native presenter event, preserving
      // its offering context rather than independently fetching another offering.
      await Purchases.purchasePackage(monthlyPackage);
      setPurchaseStatus('complete');
    } catch (purchaseError) {
      setPurchaseStatus('failed');
      setError(purchaseError instanceof Error ? purchaseError.message : String(purchaseError));
    }
  };
  const purchasing = purchaseStatus === 'in progress';
  const variableDescription = (key: string) => {
    const variable = presentation?.params.customVariables[key];
    return variable ? `${variable.type} ${String(variable.value)}` : 'missing';
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text>Checkpoint owner: {ownerId === null ? 'unmounted' : 'mounted'}</Text>
      <Text>Presentation count: {presentationCount}</Text>
      <Text>Callback count: {callbackCount}</Text>
      <Text>Callbacks before completion: {earlyCallbacks}</Text>
      <Text>Stale callbacks: {staleCallbacks}</Text>
      <Text>Completion count: {completionCount}</Text>
      <Text>Last completion: {lastCompletion}</Text>
      <Text>Customer active entitlements: {entitlements}</Text>
      {error && <Text style={styles.error}>Error: {error}</Text>}
      {ownerId !== null ? (
        <CheckpointOwner
          key={ownerId}
          ownerId={ownerId}
          presenter={presenter}
          disabled={presentation !== null}
          onPassed={onPassed}
          onError={setError}
        />
      ) : presentation === null ? (
        <TestButton
          title="Remount checkpoint owner"
          testID="remount-checkpoint-owner-button"
          onPress={() => {
            activeOwnerId.current = ++nextOwnerId.current;
            setOwnerId(activeOwnerId.current);
          }}
        />
      ) : null}
      {presentation && (
        <View style={styles.paywall}>
          <Text style={styles.title}>Custom checkpoint paywall</Text>
          <Text>Checkpoint identifier: {presentation.params.checkpointIdentifier}</Text>
          <Text>Offering identifier: {presentation.params.offering.identifier}</Text>
          <Text>Product available: {monthlyPackage?.product.identifier ?? 'missing'}</Text>
          <Text>Presentation mode: {presentation.params.presentationMode}</Text>
          <Text>Custom string: {variableDescription('name')}</Text>
          <Text>Custom number: {variableDescription('level')}</Text>
          <Text>Custom boolean: {variableDescription('premium')}</Text>
          <Text>Purchase: {purchaseStatus}</Text>
          <TestButton
            title="Buy monthly package"
            testID="custom-checkpoint-buy-button"
            disabled={!monthlyPackage || purchasing || purchaseStatus === 'complete'}
            onPress={purchase}
          />
          <View style={styles.actions}>
            <TestButton
              title="Continue checkpoint"
              testID="custom-checkpoint-continue-button"
              disabled={purchasing}
              onPress={() => finishPresentation(PAYWALL_PRESENTATION_RESULT.CONTINUED)}
            />
            <TestButton
              title="Close checkpoint"
              testID="custom-checkpoint-close-button"
              disabled={purchasing}
              onPress={() => finishPresentation(PAYWALL_PRESENTATION_RESULT.CLOSED)}
            />
            <TestButton
              title="Back from custom paywall"
              testID="custom-checkpoint-back-button"
              disabled={purchasing}
              onPress={() => finishPresentation(PAYWALL_PRESENTATION_RESULT.NAVIGATED_BACK)}
            />
          </View>
          {ownerId !== null && (
            <TestButton
              title="Unmount checkpoint owner"
              testID="unmount-checkpoint-owner-button"
              disabled={purchasing}
              onPress={() => {
                activeOwnerId.current = null;
                setOwnerId(null);
              }}
            />
          )}
        </View>
      )}
    </ScrollView>
  );
}

function TestButton({title, testID, disabled, onPress}: {
  title: string;
  testID: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled && styles.disabled]}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {padding: 12, gap: 4},
  paywall: {padding: 12, gap: 4, borderWidth: 1, borderColor: '#777'},
  title: {fontSize: 18, fontWeight: 'bold'},
  actions: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  button: {padding: 10, marginVertical: 4, backgroundColor: '#007AFF', borderRadius: 8},
  disabled: {opacity: 0.5},
  buttonText: {color: 'white', fontSize: 14},
  error: {color: 'red'},
});
