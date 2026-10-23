import React, {useEffect, useRef, useState} from 'react';
import {Button, Modal, Platform, StyleSheet, Switch, Text, TextInput, View} from 'react-native';
import RevenueCatUI, {
  CustomVariableValue,
  FLOW_PRESENTATION_MODE,
  type ErrorPresentationCompletion,
  type ErrorPresentationParams,
} from 'react-native-purchases-ui';

type PendingError = {params: ErrorPresentationParams; completion: ErrorPresentationCompletion};

const CheckpointErrorModal: React.FC<{error: PendingError; onFinished: () => void}> = ({error, onFinished}) => {
  const [visible, setVisible] = useState(true);
  const finish = () => {
    error.completion.complete();
    onFinished();
  };
  useEffect(() => {
    // Modal.onDismiss is iOS-only. With no Android animation, complete after the
    // visibility update has committed to the native view.
    if (!visible && Platform.OS === 'android') finish();
  }, [visible]);
  useEffect(() => () => error.completion.complete(), [error]);
  return (
    <Modal visible={visible} transparent animationType={Platform.OS === 'ios' ? 'fade' : 'none'}
      onRequestClose={() => setVisible(false)} onDismiss={finish}>
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          <Text style={styles.heading}>Checkpoint error</Text>
          <Text>{error.params.checkpointIdentifier}: {error.params.kind}</Text>
          <Text>{error.params.error.message}</Text>
          <Button title="Dismiss error" onPress={() => setVisible(false)} />
        </View>
      </View>
    </Modal>
  );
};

const CheckpointsScreen: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [fullScreen, setFullScreen] = useState(false);
  const [customErrors, setCustomErrors] = useState(false);
  const [error, setError] = useState<PendingError | null>(null);
  const [status, setStatus] = useState('Enter a dashboard checkpoint identifier.');
  const callbacks = useRef(new Set<() => void>());

  useEffect(() => {
    if (!customErrors) return;
    try {
      RevenueCatUI.setErrorPresenter((params, completion) => setError({params, completion}));
    } catch (e) {
      setStatus(String(e));
      return;
    }
    return () => {
      RevenueCatUI.setErrorPresenter(null);
      setError(null);
    };
  }, [customErrors]);

  useEffect(() => () => {
    callbacks.current.forEach(remove => remove());
  }, []);

  const run = () => {
    setStatus('Checkpoint called. Only passing it updates this status; backing out keeps you here.');
    try {
      const remove = RevenueCatUI.checkpoint(identifier, result => {
        callbacks.current.delete(remove);
        setStatus(JSON.stringify(result, null, 2));
      }, {
        presentationMode: fullScreen ? FLOW_PRESENTATION_MODE.MODAL_FULL_SCREEN : FLOW_PRESENTATION_MODE.MODAL_SHEET,
        customVariables: {source: CustomVariableValue.string('react_native_tester')},
      });
      callbacks.current.add(remove);
    } catch (e) {
      setStatus(String(e));
    }
  };

  return (
    <View style={styles.container}>
      <TextInput accessibilityLabel="Checkpoint identifier" style={styles.input} value={identifier}
        onChangeText={setIdentifier} autoCapitalize="none" placeholder="Checkpoint identifier" />
      <View style={styles.row}><Text>Full screen</Text><Switch value={fullScreen} onValueChange={setFullScreen} /></View>
      <View style={styles.row}><Text>Custom error Modal</Text><Switch value={customErrors} onValueChange={setCustomErrors} /></View>
      <Button title="Run checkpoint" onPress={run} />
      <Text numberOfLines={15}>{status}</Text>
      <RevenueCatUI.PaywallPortal onHostDismissed={() => setError(null)}>
        {error && <CheckpointErrorModal key={error.params.error.message} error={error} onFinished={() => setError(null)} />}
      </RevenueCatUI.PaywallPortal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, gap: 16},
  input: {borderWidth: 1, borderColor: '#888', padding: 12, borderRadius: 8},
  row: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  backdrop: {flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.5)'},
  panel: {backgroundColor: 'white', borderRadius: 12, padding: 24, gap: 12},
  heading: {fontSize: 20, fontWeight: '600'},
});

export default CheckpointsScreen;
