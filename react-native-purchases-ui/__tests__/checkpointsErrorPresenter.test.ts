type Listener = (event: any) => void;
const mockListeners = new Map<string, Set<Listener>>();
const mockNative: {
  checkpoint: jest.Mock;
  checkpointWithErrorPresenter: jest.Mock;
  completeError: jest.Mock;
  checkpointEmbedded?: jest.Mock;
  cancelEmbedded: jest.Mock;
  completeEmbeddedError: jest.Mock;
} = {
  checkpoint: jest.fn(),
  checkpointWithErrorPresenter: jest.fn(),
  completeError: jest.fn(),
  checkpointEmbedded: jest.fn(),
  cancelEmbedded: jest.fn(),
  completeEmbeddedError: jest.fn(),
};
let mockPreview = false;
const mockPlatform = { OS: 'ios', Version: '18.0' };

jest.mock('react-native', () => ({
  NativeModules: { RNCheckpoints: mockNative },
  NativeEventEmitter: class {
    addListener(name: string, listener: Listener) {
      if (!mockListeners.has(name)) mockListeners.set(name, new Set());
      mockListeners.get(name)!.add(listener);
      return { remove: () => mockListeners.get(name)!.delete(listener) };
    }
  },
  Platform: mockPlatform,
  Modal: 'Modal',
  View: 'View',
}));
jest.mock('../src/utils/environment', () => ({ shouldUsePreviewAPIMode: () => mockPreview }));

import { checkpoint, FLOW_PRESENTATION_MODE, type CheckpointErrorRequest } from '../src/checkpoints';
import { checkpointHost, type CheckpointHostSession } from '../src/checkpointHost';
import { CustomVariableValue } from '../src/customVariables';

const EMBEDDED = 'Checkpoints-embedded';
const PASSED = 'Checkpoints-onPassed';
const ERROR = 'Checkpoints-onError';
const emit = (name: string, event: any) => mockListeners.get(name)?.forEach(listener => listener(event));
const listenerCount = () => [...mockListeners.values()].reduce((total, set) => total + set.size, 0);
const result = { flow: null, customer: { originalAppUserId: 'user' } };
const nativeError = { code: 42, message: 'Simulated', readableErrorCode: 'TEST_STORE_SIMULATED_PURCHASE_ERROR' };
let hostSessions: CheckpointHostSession[] = [];
let detachHost = () => {};

const session = () => hostSessions[0]!;
const iosCallId = (index = 0) => mockNative.checkpointEmbedded!.mock.calls[index]![2];
const androidCallId = (index = 0) => mockNative.checkpointWithErrorPresenter.mock.calls[index]![3];

function start(
  params: { presentationMode?: FLOW_PRESENTATION_MODE } = {},
  errorPresenter: jest.Mock = jest.fn(() => 'error-ui'),
) {
  const onPassed = jest.fn();
  const remove = checkpoint('upgrade', onPassed, {
    customVariables: { name: CustomVariableValue.string('Taylor'), level: CustomVariableValue.number(2) },
    errorPresenter,
    ...params,
  });
  return { remove, onPassed, errorPresenter };
}

function startIOS(params?: { presentationMode?: FLOW_PRESENTATION_MODE }, errorPresenter?: jest.Mock) {
  const started = start(params, errorPresenter);
  session().onShow?.();
  return started;
}

beforeEach(() => {
  mockPlatform.OS = 'ios';
  mockPlatform.Version = '18.0';
  mockPreview = false;
  mockListeners.clear();
  jest.clearAllMocks();
  hostSessions = [];
  detachHost = checkpointHost.attach(sessions => { hostSessions = sessions; });
});

afterEach(() => {
  hostSessions.forEach(candidate => checkpointHost.remove(candidate.callId));
  detachHost();
});

describe('without an errorPresenter', () => {
  it('uses the modal path on both platforms and needs no host', () => {
    detachHost();
    checkpoint('upgrade', jest.fn());
    mockPlatform.OS = 'android';
    checkpoint('upgrade', jest.fn());
    expect(mockNative.checkpoint).toHaveBeenCalledTimes(2);
    expect(mockNative.checkpointEmbedded).not.toHaveBeenCalled();
    expect(mockNative.checkpointWithErrorPresenter).not.toHaveBeenCalled();
  });
});

describe('errorPresenter', () => {
  it('requires a mounted host on both platforms', () => {
    detachHost();
    expect(() => start()).toThrow(/CheckpointHost/);
    mockPlatform.OS = 'android';
    expect(() => start()).toThrow(/CheckpointHost/);
    expect(listenerCount()).toBe(0);
  });

  it.each(['web', 'preview', 'ios13'])('rejects unsupported environment %s', environment => {
    if (environment === 'web') mockPlatform.OS = 'web';
    if (environment === 'preview') mockPreview = true;
    if (environment === 'ios13') mockPlatform.Version = '13.0';
    expect(() => start()).toThrow(/require/);
    expect(hostSessions).toHaveLength(0);
    expect(listenerCount()).toBe(0);
  });
});

describe('iOS', () => {
  it('opens a container per presentationMode and embeds once it is on screen', () => {
    start({ presentationMode: FLOW_PRESENTATION_MODE.MODAL_FULL_SCREEN });
    expect(session().presentationStyle).toBe('fullScreen');
    expect(session().visible).toBe(true);
    expect(mockNative.checkpointEmbedded).not.toHaveBeenCalled();
    session().onShow?.();
    expect(mockNative.checkpointEmbedded).toHaveBeenCalledWith('upgrade', { name: 'Taylor', level: 2 }, expect.any(String));
    checkpointHost.remove(session().callId);

    start();
    expect(session().presentationStyle).toBe('pageSheet');
    checkpointHost.remove(session().callId);
    start({ presentationMode: FLOW_PRESENTATION_MODE.DEFAULT });
    expect(session().presentationStyle).toBe('pageSheet');
  });

  it('rejects builds without the embedded native method before opening anything', () => {
    const method = mockNative.checkpointEmbedded!;
    delete mockNative.checkpointEmbedded;
    try {
      expect(() => start()).toThrow(/local purchases-ios/);
    } finally {
      mockNative.checkpointEmbedded = method;
    }
    expect(hostSessions).toHaveLength(0);
  });

  it('renders the presenter element in the container and acknowledges once it completes', () => {
    const { errorPresenter } = startIOS();
    emit(EMBEDDED, { callId: iosCallId(), type: 'error', requestId: 'r1', kind: 'flowActionFailed', error: nativeError });
    emit(EMBEDDED, { callId: iosCallId(), type: 'error', requestId: 'r1', kind: 'flowActionFailed', error: nativeError });
    expect(errorPresenter).toHaveBeenCalledTimes(1);
    const request: CheckpointErrorRequest = errorPresenter.mock.calls[0]![0];
    expect(request.kind).toBe('flowActionFailed');
    expect(request.error.code).toBe('42');
    expect(request.error.readableErrorCode).toBe('TEST_STORE_SIMULATED_PURCHASE_ERROR');
    expect(session().error).toBe('error-ui');
    expect(mockNative.completeEmbeddedError).not.toHaveBeenCalled();
    request.complete();
    request.complete();
    expect(session().error).toBeNull();
    expect(mockNative.completeEmbeddedError).toHaveBeenCalledTimes(1);
    expect(mockNative.completeEmbeddedError).toHaveBeenCalledWith(iosCallId(), 'r1');
  });

  it('acknowledges right away when the presenter throws, so the flow is never left blocked', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    startIOS(undefined, jest.fn(() => { throw new Error('boom'); }));
    emit(EMBEDDED, { callId: iosCallId(), type: 'error', requestId: 'r1', kind: 'flowActionFailed', error: nativeError });
    expect(mockNative.completeEmbeddedError).toHaveBeenCalledWith(iosCallId(), 'r1');
    expect(session().error).toBeNull();
    warn.mockRestore();
  });

  it('passes once, then closes the container when the native flow finishes', () => {
    const { onPassed } = startIOS();
    emit(EMBEDDED, { callId: 'unrelated', type: 'passed', result });
    emit(EMBEDDED, { callId: iosCallId(), type: 'passed', result });
    emit(EMBEDDED, { callId: iosCallId(), type: 'passed', result });
    expect(onPassed).toHaveBeenCalledTimes(1);
    expect(onPassed).toHaveBeenCalledWith(result);
    expect(session().visible).toBe(true);
    emit(EMBEDDED, { callId: iosCallId(), type: 'finished' });
    expect(session().visible).toBe(false);
    expect(listenerCount()).toBe(0);
    emit(EMBEDDED, { callId: iosCallId(), type: 'error', requestId: 'r2', kind: 'flowActionFailed', error: nativeError });
    expect(mockNative.completeEmbeddedError).not.toHaveBeenCalled();
  });

  it('cancels natively from the remove function and waits for finished to close', () => {
    const { remove } = startIOS();
    remove();
    remove();
    expect(mockNative.cancelEmbedded).toHaveBeenCalledTimes(1);
    expect(mockNative.cancelEmbedded).toHaveBeenCalledWith(iosCallId());
    expect(session().visible).toBe(true);
    emit(EMBEDDED, { callId: iosCallId(), type: 'finished' });
    expect(session().visible).toBe(false);
  });

  it('cancels natively when the user dismisses the container', () => {
    startIOS();
    session().onDismiss?.();
    expect(mockNative.cancelEmbedded).toHaveBeenCalledWith(iosCallId());
  });

  it('nests concurrent sessions and keeps their events separate', () => {
    const first = startIOS();
    const second = start();
    expect(hostSessions.map(candidate => candidate.callId)).toEqual([iosCallId(0), second && hostSessions[1]!.callId]);
    emit(EMBEDDED, { callId: iosCallId(0), type: 'passed', result });
    expect(first.onPassed).toHaveBeenCalledTimes(1);
    expect(second.onPassed).not.toHaveBeenCalled();
  });

  it('removes the listener and container if invoking native code fails', () => {
    mockNative.checkpointEmbedded!.mockImplementationOnce(() => { throw new Error('bridge unavailable'); });
    start();
    expect(() => session().onShow?.()).toThrow('bridge unavailable');
  });
});

describe('Android', () => {
  beforeEach(() => { mockPlatform.OS = 'android'; });

  it('lets the SDK present the flow and only hosts the error UI', () => {
    start({ presentationMode: FLOW_PRESENTATION_MODE.MODAL_FULL_SCREEN });
    expect(mockNative.checkpointWithErrorPresenter).toHaveBeenCalledWith(
      'upgrade', { name: 'Taylor', level: 2 }, 'MODAL_FULL_SCREEN', expect.any(String));
    expect(mockNative.checkpointEmbedded).not.toHaveBeenCalled();
    expect(session().presentationStyle).toBeNull();
  });

  it('renders the presenter element and acknowledges through completeError', () => {
    const { errorPresenter } = start();
    emit(ERROR, { callId: androidCallId(), requestId: 'r1', kind: 'flowCouldNotBeShown', error: nativeError });
    const request: CheckpointErrorRequest = errorPresenter.mock.calls[0]![0];
    expect(request.kind).toBe('flowCouldNotBeShown');
    expect(session().error).toBe('error-ui');
    request.complete();
    expect(session().error).toBeNull();
    expect(mockNative.completeError).toHaveBeenCalledWith(androidCallId(), 'r1');
    expect(mockNative.completeEmbeddedError).not.toHaveBeenCalled();
  });

  it('passes once and ends the session, since Android reports no finish', () => {
    const { onPassed } = start();
    emit(PASSED, { callId: androidCallId(), result });
    expect(onPassed).toHaveBeenCalledWith(result);
    expect(hostSessions).toHaveLength(0);
    expect(listenerCount()).toBe(0);
  });

  it('detaches from the remove function without cancelling anything natively', () => {
    const { remove, onPassed } = start();
    remove();
    expect(hostSessions).toHaveLength(0);
    emit(PASSED, { callId: androidCallId(), result });
    expect(onPassed).not.toHaveBeenCalled();
    expect(mockNative.cancelEmbedded).not.toHaveBeenCalled();
  });
});
