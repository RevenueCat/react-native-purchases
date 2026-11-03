import React, {useEffect, useRef, useState} from 'react';
import {Button, StyleSheet, Switch, Text, TextInput, View} from 'react-native';
import RevenueCatUI, {
  CustomVariableValue,
  FLOW_PRESENTATION_MODE,
} from 'react-native-purchases-ui';

const CheckpointsScreen: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [fullScreen, setFullScreen] = useState(false);
  const [customErrorDialog, setCustomErrorDialog] = useState(false);
  const [status, setStatus] = useState('Enter a dashboard checkpoint identifier. An invalid one, like "!", shows the error dialog.');
  const callbacks = useRef(new Set<() => void>());

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
        errorDialogFactory: customErrorDialog
          ? error => ({
            type: 'show',
            dialog: {message: `Custom dialog (${error.kind}, ${error.code}): ${error.message}`, buttonTitle: 'Got it'},
          })
          : undefined,
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
      <View style={styles.row}>
        <Text>Custom error dialog</Text><Switch value={customErrorDialog} onValueChange={setCustomErrorDialog} />
      </View>
      <Button title="Run checkpoint" onPress={run} />
      <Text numberOfLines={15}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, gap: 16},
  input: {borderWidth: 1, borderColor: '#888', padding: 12, borderRadius: 8},
  row: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
});

export default CheckpointsScreen;
