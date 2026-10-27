import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Button,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import RevenueCatUI, {
  CustomVariableValue,
  type EmbeddedCheckpointErrorRequest,
  type EmbeddedCheckpointHandle,
} from 'react-native-purchases-ui';

type Container = 'none' | 'sheet' | 'fullScreen';

// The ordinary React Native error modal. It stays mounted while hiding so onDismiss can acknowledge
// the native error only after the modal has really gone away.
const EmbeddedErrorModal: React.FC<{
  request: EmbeddedCheckpointErrorRequest;
  append: (message: string) => void;
}> = ({request, append}) => {
  const [visible, setVisible] = useState(true);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onShow={() => append(`Error modal shown: ${request.kind} (${request.requestId.slice(0, 8)})`)}
      onRequestClose={() => setVisible(false)}
      onDismiss={() => {
        append(`Error modal dismissed, completing ${request.requestId.slice(0, 8)}`);
        request.complete();
      }}>
      <View style={styles.backdrop}>
        <View style={styles.panel} testID="embedded-error-modal">
          <Text style={styles.heading}>Checkpoint error (RN Modal)</Text>
          <Text>{request.kind}</Text>
          <Text>{request.error.message}</Text>
          <Text>
            {request.error.readableErrorCode} ({request.error.code})
          </Text>
          <Button title="Acknowledge error" onPress={() => setVisible(false)} />
        </View>
      </View>
    </Modal>
  );
};

const EmbeddedCheckpointScreen: React.FC = () => {
  const [mounted, setMounted] = useState(true);
  const [remount, setRemount] = useState(0);
  return (
    <View style={styles.flex}>
      {mounted ? (
        <EmbeddedCheckpointTester
          key={remount}
          unmountAfter={ms => setTimeout(() => setMounted(false), ms)}
        />
      ) : (
        <View style={styles.screen}>
          <Text>Tester unmounted (executions cancelled on unmount).</Text>
          <Button title="Mount tester again" onPress={() => { setRemount(r => r + 1); setMounted(true); }} />
        </View>
      )}
    </View>
  );
};

const EmbeddedCheckpointTester: React.FC<{unmountAfter: (ms: number) => void}> = ({unmountAfter}) => {
  const [identifier, setIdentifier] = useState('rn_error_presenter_test');
  const [container, setContainer] = useState<Container>('none');
  const [containerShown, setContainerShown] = useState(false);
  const [running, setRunning] = useState(0);
  const [errors, setErrors] = useState<EmbeddedCheckpointErrorRequest[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const handles = useRef(new Set<EmbeddedCheckpointHandle>());

  const append = useCallback((message: string) => {
    const stamp = new Date().toISOString().slice(11, 23);
    setLog(current => [`${stamp} ${message}`, ...current].slice(0, 40));
    console.info(`[Embedded checkpoint tester] ${message}`);
  }, []);

  // Cancel every execution owned by this screen when it unmounts.
  useEffect(
    () => () => {
      handles.current.forEach(handle => handle.cancel());
      handles.current.clear();
    },
    [],
  );

  const run = useCallback(() => {
    const name = identifier.trim();
    append(`Start ${name} in ${container === 'none' ? 'screen' : container}`);
    try {
      const handle = RevenueCatUI.checkpointEmbedded(
        name,
        {
          onPassed: result => append(`onPassed flow=${JSON.stringify(result.flow)}`),
          onError: request => {
            append(`onError ${request.kind}: ${request.error.message}`);
            setErrors(current => [...current, request]);
          },
          onFinished: () => {
            append('onFinished');
            handles.current.delete(handle);
            setRunning(current => Math.max(0, current - 1));
          },
        },
        {customVariables: {source: CustomVariableValue.string('rn_embedded_tester')}},
      );
      handles.current.add(handle);
      setRunning(current => current + 1);
    } catch (error) {
      append(`Start rejected: ${String(error)}`);
    }
  }, [append, container, identifier]);

  const cancelAll = useCallback(() => {
    append(`Cancel ${handles.current.size} execution(s)`);
    handles.current.forEach(handle => handle.cancel());
  }, [append]);

  const closeContainer = useCallback(() => {
    append(`Close ${container} container`);
    setContainer('none');
    setContainerShown(false);
  }, [append, container]);

  // The SDK notices its parent being torn down (dismissed, popped, or released) and cancels the flow itself;
  // the tester only logs so that onFinished below proves the SDK path. Cancel on unmount stays app-owned.
  const onContainerDismissed = useCallback(() => {
    append(`Container dismissed with ${handles.current.size} execution(s) still owned`);
  }, [append]);

  const controls = (
    <View style={styles.controls}>
      <Button title={`Run checkpoint (${running} running)`} onPress={run} disabled={container !== 'none' && !containerShown} />
      <Button title="Run twice (concurrent)" onPress={() => { run(); run(); }} disabled={container !== 'none' && !containerShown} />
      <Button title="Cancel all" onPress={cancelAll} />
      <Button title="Run, cancel after 8s" onPress={() => { run(); setTimeout(cancelAll, 8000); }} />
      <Button title="Run, unmount tester after 8s" onPress={() => { run(); append('Unmount scheduled'); unmountAfter(8000); }} />
      {container !== 'none' && <Button title="Close container while running" onPress={closeContainer} />}
    </View>
  );

  const errorModal = errors[0] ? (
    <EmbeddedErrorModal
      key={errors[0].requestId}
      request={{
        ...errors[0],
        complete: () => {
          errors[0]?.complete();
          setErrors(current => current.slice(1));
        },
      }}
      append={append}
    />
  ) : null;

  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>SDK-owned embedded checkpoint</Text>
      <Text>
        The native SDK embeds the flow in the React Native view controller on screen. Errors are shown by an
        ordinary RN Modal rendered from this screen.
      </Text>
      <TextInput
        accessibilityLabel="Checkpoint identifier"
        style={styles.input}
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {controls}
      <Button title="Open RN sheet" onPress={() => { append('Open sheet'); setContainer('sheet'); }} />
      <Button title="Open RN full-screen modal" onPress={() => { append('Open fullScreen'); setContainer('fullScreen'); }} />
      {log.map((message, index) => (
        <Text key={index} style={styles.log}>{message}</Text>
      ))}
      <Modal
        visible={container !== 'none'}
        presentationStyle={container === 'sheet' ? 'pageSheet' : 'fullScreen'}
        animationType="slide"
        onShow={() => { append(`${container} container shown`); setContainerShown(true); }}
        onRequestClose={closeContainer}
        onDismiss={onContainerDismissed}>
        <View style={styles.container}>
          <Text style={styles.heading}>RN {container} container</Text>
          <Text>Launch after onShow so the modal controller is on screen.</Text>
          {controls}
          {log.slice(0, 12).map((message, index) => (
            <Text key={index} style={styles.log}>{message}</Text>
          ))}
        </View>
        {errorModal}
      </Modal>
      {container === 'none' && errorModal}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  screen: {padding: 16, gap: 12},
  container: {flex: 1, padding: 24, gap: 12, backgroundColor: 'white'},
  controls: {gap: 8},
  heading: {fontSize: 20, fontWeight: '600'},
  input: {borderWidth: 1, borderColor: '#888', borderRadius: 6, padding: 12},
  log: {fontSize: 12, color: '#555'},
  backdrop: {flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0008'},
  panel: {padding: 24, borderRadius: 12, gap: 12, backgroundColor: 'white'},
});

export default EmbeddedCheckpointScreen;
