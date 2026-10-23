import React, {useCallback, useState} from 'react';
import {
  Button,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import RevenueCatUI, {type CheckpointErrorRequest} from 'react-native-purchases-ui';
import {useCustomVariables} from '../context/CustomVariablesContext';

type PresentationMode = 'fullScreen' | 'pageSheet';

// Keep the request mounted while its Modal hides so onDismiss can acknowledge
// the actual dismissal before the native checkpoint continues.
const CheckpointErrorModal: React.FC<{
  request: CheckpointErrorRequest;
  append: (message: string) => void;
  unmountHost: () => void;
}> = ({request, append, unmountHost}) => {
  const [visible, setVisible] = useState(true);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onShow={() => append(`Error shown: ${request.kind} (${request.requestId})`)}
      onRequestClose={() => setVisible(false)}
      onDismiss={() => {
        append(`Error dismissed: ${request.requestId}`);
        request.complete();
      }}>
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          <Text style={styles.heading}>Checkpoint error</Text>
          <Text>{request.kind}</Text>
          <Text>{request.error.message}</Text>
          <Text>Error code: {JSON.stringify(request.error.code)}</Text>
          <Text>{request.error.userInfo.readableErrorCode}</Text>
          <Button title="Acknowledge error" onPress={() => setVisible(false)} />
          <Button title="Unmount host during error" onPress={unmountHost} />
        </View>
      </View>
    </Modal>
  );
};

const PaywallModalHostScreen: React.FC = () => {
  const [identifier, setIdentifier] = useState('rn_error_presenter_test');
  const [presentationMode, setPresentationMode] =
    useState<PresentationMode>('fullScreen');
  const [running, setRunning] = useState(false);
  const [hostMounted, setHostMounted] = useState(true);
  const [log, setLog] = useState<string[]>([]);
  const {customVariables} = useCustomVariables();
  const append = useCallback((message: string) => {
    setLog(current => [message, ...current].slice(0, 30));
    console.info(`[Checkpoint tester] ${message}`);
  }, []);

  const launch = async () => {
    setRunning(true);
    append(`Starting ${identifier.trim()} (${presentationMode})`);
    try {
      await RevenueCatUI.checkpoint(
        identifier.trim(),
        {presentationMode, customVariables},
        result => append(`Native onPassed: ${JSON.stringify(result)}`),
      );
      append('Native session finished');
    } catch (error) {
      append(`Checkpoint rejected: ${String(error)}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Real checkpoint host</Text>
      <Text>
        Runs the configured native workflow or offering. Use a Test Store or
        sandbox purchase failure to exercise the custom error Modal.
      </Text>
      <TextInput
        accessibilityLabel="Checkpoint identifier"
        style={styles.input}
        value={identifier}
        editable={!running}
        onChangeText={setIdentifier}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button
        title={`Fullscreen${presentationMode === 'fullScreen' ? ' (selected)' : ''}`}
        disabled={running}
        onPress={() => setPresentationMode('fullScreen')}
      />
      <Button
        title={`Sheet${presentationMode === 'pageSheet' ? ' (selected)' : ''}`}
        disabled={running}
        onPress={() => setPresentationMode('pageSheet')}
      />
      <Text>Global custom variables: {Object.keys(customVariables).length}</Text>
      <Button
        title={running ? 'Checkpoint running' : 'Run checkpoint'}
        disabled={running || !hostMounted || !identifier.trim()}
        onPress={launch}
      />
      <Button
        title={hostMounted ? 'Unmount checkpoint host' : 'Mount checkpoint host'}
        onPress={() => {
          append(hostMounted ? 'Unmounting host' : 'Mounting host');
          setHostMounted(current => !current);
        }}
      />
      {log.map((message, index) => (
        <Text key={index} style={styles.log}>{message}</Text>
      ))}
      {hostMounted && (
        <RevenueCatUI.CheckpointHost renderError={request => (
          <CheckpointErrorModal request={request} append={append} unmountHost={() => {
            append('Unmounting host during native error');
            setHostMounted(false);
          }} />
        )} />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {padding: 16, gap: 12},
  heading: {fontSize: 20, fontWeight: '600'},
  input: {borderWidth: 1, borderColor: '#888', borderRadius: 6, padding: 12},
  log: {fontSize: 12, color: '#555'},
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0008',
  },
  panel: {padding: 24, borderRadius: 12, gap: 12, backgroundColor: 'white'},
});

export default PaywallModalHostScreen;
