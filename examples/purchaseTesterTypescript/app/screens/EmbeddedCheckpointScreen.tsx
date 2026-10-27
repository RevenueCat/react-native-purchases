import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Button, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, View} from 'react-native';
import RevenueCatUI, {
  CustomVariableValue,
  FLOW_PRESENTATION_MODE,
  type CheckpointErrorRequest,
} from 'react-native-purchases-ui';

// The app's error UI: an ordinary transparent <Modal>. <CheckpointHost /> (mounted in App.tsx) renders it
// where it can present above the flow. It stays mounted while hiding so onDismiss acknowledges the native
// error only after the modal has really gone away.
const ErrorModal: React.FC<{request: CheckpointErrorRequest; append: (message: string) => void}> = ({request, append}) => {
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
        <View style={styles.panel} testID="checkpoint-error-modal">
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
  const [identifier, setIdentifier] = useState('rn_error_presenter_test');
  const [fullScreen, setFullScreen] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const removers = useRef(new Set<() => void>());

  const append = useCallback((message: string) => {
    const stamp = new Date().toISOString().slice(11, 23);
    setLog(current => [`${stamp} ${message}`, ...current].slice(0, 40));
    console.info(`[Checkpoint error presenter tester] ${message}`);
  }, []);

  // Detach every call owned by this screen when it unmounts. On iOS this also removes the embedded flow.
  useEffect(
    () => () => {
      removers.current.forEach(remove => remove());
      removers.current.clear();
    },
    [],
  );

  const run = useCallback(() => {
    const name = identifier.trim();
    append(`Start ${name} (${fullScreen ? 'full screen' : 'sheet'})`);
    try {
      const remove = RevenueCatUI.checkpoint(
        name,
        result => {
          append(`onPassed flow=${JSON.stringify(result.flow)}`);
          removers.current.delete(remove);
        },
        {
          customVariables: {source: CustomVariableValue.string('rn_error_presenter_tester')},
          presentationMode: fullScreen
            ? FLOW_PRESENTATION_MODE.MODAL_FULL_SCREEN
            : FLOW_PRESENTATION_MODE.MODAL_SHEET,
          errorPresenter: request => {
            append(`errorPresenter ${request.kind}: ${request.error.message}`);
            return <ErrorModal key={request.requestId} request={request} append={append} />;
          },
        },
      );
      removers.current.add(remove);
    } catch (error) {
      append(`Start rejected: ${String(error)}`);
    }
  }, [append, fullScreen, identifier]);

  const removeAll = useCallback(() => {
    append(`Remove ${removers.current.size} call(s)`);
    removers.current.forEach(remove => remove());
    removers.current.clear();
  }, [append]);

  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Checkpoint with errorPresenter</Text>
      <Text>
        Same call on both platforms. On iOS the host opens the container and the SDK embeds the flow in it; on
        Android the SDK presents the flow itself. Errors are shown by an ordinary RN Modal.
      </Text>
      <TextInput
        accessibilityLabel="Checkpoint identifier"
        style={styles.input}
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={styles.row}>
        <Text>Full screen</Text>
        <Switch value={fullScreen} onValueChange={setFullScreen} />
      </View>
      <Button title="Run checkpoint" onPress={run} />
      <Button title="Run twice (concurrent)" onPress={() => { run(); run(); }} />
      <Button title="Remove all (cancels on iOS)" onPress={removeAll} />
      <Button title="Run, remove after 8s" onPress={() => { run(); setTimeout(removeAll, 8000); }} />
      {log.map((message, index) => (
        <Text key={index} style={styles.log}>{message}</Text>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {padding: 16, gap: 12},
  row: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  heading: {fontSize: 20, fontWeight: '600'},
  input: {borderWidth: 1, borderColor: '#888', borderRadius: 6, padding: 12},
  log: {fontSize: 12, color: '#555'},
  backdrop: {flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0008'},
  panel: {padding: 24, borderRadius: 12, gap: 12, backgroundColor: 'white'},
});

export default EmbeddedCheckpointScreen;
