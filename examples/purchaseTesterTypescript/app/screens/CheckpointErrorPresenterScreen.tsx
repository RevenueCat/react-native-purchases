// Throwaway runtime experiment. These methods are not public RevenueCat APIs.
import React, {useEffect, useRef, useState} from 'react';
import {Alert, Button, Modal, NativeEventEmitter, NativeModules, Platform, ScrollView, Text, View} from 'react-native';
import Purchases from 'react-native-purchases';
import {ErrorPresentationHost} from './ErrorPresentationHost';

type Action = 'RETRY' | 'CONTINUE' | 'NAVIGATE_BACK';
type ErrorRequest = {
  requestId: string;
  checkpointIdentifier: string;
  error: {message: string; code?: number};
  flowCanContinue: boolean;
};
const native = NativeModules.RNPaywalls;
const actions: Action[] = ['RETRY', 'CONTINUE', 'NAVIGATE_BACK'];
const identifier = 'rn_error_presenter_test';

export default function CheckpointErrorPresenterScreen() {
  const [ui, setUI] = useState<'alert' | 'modal' | 'overlay' | 'host' | 'auto'>('alert');
  const uiRef = useRef(ui);
  uiRef.current = ui;
  const [requests, setRequests] = useState<ErrorRequest[]>([]);
  const [passed, setPassed] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);
  const lastDecision = useRef<{requestId: string; action: Action} | null>(null);
  const log = (message: string) => {
    console.log(`[CheckpointTest JS] ${message}`);
    native.logCheckpointForTest?.(message);
    setMessages(previous => [...previous.slice(-29), message]);
  };
  const complete = (request: ErrorRequest, action: Action) => {
    log(`selection requestId=${request.requestId} action=${action}`);
    lastDecision.current = {requestId: request.requestId, action};
    setRequests(previous => previous.filter(item => item.requestId !== request.requestId));
    // Deliberately direct: do not wait for Modal/Alert dismissal or a timer.
    native.completeCheckpointErrorForTest(request.requestId, action);
  };
  useEffect(() => {
    const emitter = new NativeEventEmitter(native);
    const errorSubscription = emitter.addListener('checkpointErrorForTest', payload => {
      const request = payload as ErrorRequest;
      log(`event requestId=${request.requestId} flowCanContinue=${request.flowCanContinue}`);
      if (uiRef.current === 'auto') {
        log('No UI: answering Continue immediately');
        complete(request, 'CONTINUE');
        return;
      }
      setRequests(previous => [...previous, request]);
      if (uiRef.current === 'alert') {
        Alert.alert('Checkpoint SDK error', request.error.message,
          actions.map(action => ({text: action, onPress: () => complete(request, action)})),
          {cancelable: false});
      }
    });
    const passedSubscription = emitter.addListener('checkpointPassedForTest', result => {
      setPassed(count => count + 1);
      log(`onPassed ${JSON.stringify(result)}`);
    });
    const cancelledSubscription = emitter.addListener('checkpointErrorCancelledForTest', payload => {
      const event = payload as {requestId: string};
      log(`cancelled requestId=${event.requestId}`);
      setRequests(current => current.filter(item => item.requestId !== event.requestId));
    });
    return () => {
      cancelledSubscription.remove();
      errorSubscription.remove();
      passedSubscription.remove();
      // Unmount does not invent a completion decision. Reload policy is native-owned.
    };
  }, []);
  const start = (mode: 'sheet' | 'fullscreen', baseline = false) => {
    log(`start mode=${mode} ui=${uiRef.current} baseline=${baseline}`);
    try {
      if (baseline) native.checkpointDefaultForTest(identifier, mode);
      else native.checkpointForTest(identifier, mode);
    } catch (error) {
      log(`invoke failed: ${String(error)}`);
    }
  };
  const request = requests[0];
  const errorContent = request ? (
    <View style={{padding: 24, backgroundColor: 'white'}}>
      <Text>Actual SDK error: {request.error.message}</Text>
      <Text>Request: {request.requestId}</Text>
      <Text>flowCanContinue: {String(request.flowCanContinue)}</Text>
      {actions.map(action => <Button key={action} title={action} onPress={() => complete(request, action)} />)}
    </View>
  ) : null;
  return (
    <View style={{flex: 1}}>
      <ScrollView contentContainerStyle={{padding: 16, gap: 10}}>
        <Text>Checkpoint ErrorPresenter experiment</Text>
        <Text>Pending JS requests: {requests.length}; onPassed: {passed}</Text>
        <Text>Choose Test failed purchase in the Test Store dialog. Cancellation is not an error.</Text>
        <Button title="Fresh test customer" onPress={async () => {
          await Purchases.logIn(`rn-error-test-${Date.now()}`);
          const offerings = await Purchases.getOfferings();
          log(`Fresh test customer configured; offerings=${Object.keys(offerings.all).length} golfPresent=${!!offerings.all.golf}`);
        }} />
        {(['alert', 'modal', 'overlay', 'auto', ...(Platform.OS === 'ios' ? ['host' as const] : [])] as const).map(choice =>
          <Button key={choice} title={`${ui === choice ? '✓ ' : ''}${choice}`} onPress={() => setUI(choice)} disabled={requests.length > 0} />)}
        <Button title="Default presenter baseline (sheet)" onPress={() => start('sheet', true)} />
        <Button title="Checkpoint sheet" onPress={() => start('sheet')} />
        <Button title="Checkpoint fullscreen" onPress={() => start('fullscreen')} />
        <Button title="Repeat last decision (duplicate probe)" onPress={() => {
          const decision = lastDecision.current;
          if (decision) native.completeCheckpointErrorForTest(decision.requestId, decision.action);
        }} />
        {messages.map((message, index) => <Text key={index} selectable>{message}</Text>)}
      </ScrollView>
      <Modal visible={ui === 'modal' && !!request} transparent animationType="none"
        onShow={() => log('Modal onShow')} onDismiss={() => log('Modal onDismiss')}
        onRequestClose={() => { if (request) complete(request, 'NAVIGATE_BACK'); }}>
        <View style={{flex: 1, justifyContent: 'center', backgroundColor: '#0008'}}>{errorContent}</View>
      </Modal>
      {ui === 'host' && request && (
        <ErrorPresentationHost key={request.requestId} request={request} onLog={log}
          onClosed={requestId => setRequests(current => current.filter(item => item.requestId !== requestId))}>
          {({respond}) => (
            <View style={{flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0008'}}>
              <View style={{padding: 24, backgroundColor: 'white', gap: 12}}>
                <Text>Custom React error panel</Text>
                <Text>{request.error.message}</Text>
                <Text>Request: {request.requestId}</Text>
                {actions.map(action => <Button key={action} title={action} onPress={() => {
                  lastDecision.current = {requestId: request.requestId, action};
                  respond(action);
                }} />)}
                <Button title="Close native flow (lifecycle probe)"
                  onPress={() => native.closeCheckpointFlowForTest()} />
              </View>
            </View>
          )}
        </ErrorPresentationHost>
      )}
      {ui === 'overlay' && request && <View style={{position: 'absolute', inset: 0, justifyContent: 'center', backgroundColor: '#0008'}}>{errorContent}</View>}
    </View>
  );
}
