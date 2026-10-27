type Listener = (event: any) => void;
const mockListeners = new Map<string, Set<Listener>>();
const mockNative: {
  checkpoint: jest.Mock;
  checkpointEmbedded?: jest.Mock;
  cancelEmbedded: jest.Mock;
  completeEmbeddedError: jest.Mock;
} = {
  checkpoint: jest.fn(),
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
}));
jest.mock('../src/utils/environment', () => ({ shouldUsePreviewAPIMode: () => mockPreview }));

import { checkpoint, type CheckpointErrorRequest } from '../src/checkpoints';
import { CustomVariableValue } from '../src/customVariables';

const EVENT = 'Checkpoints-embedded';
const emit = (event: any) => mockListeners.get(EVENT)?.forEach(listener => listener(event));
const listenerCount = () => mockListeners.get(EVENT)?.size ?? 0;
const callId = (index: number) => mockNative.checkpointEmbedded!.mock.calls[index]![2];
const result = { flow: null, customer: { originalAppUserId: 'user' } };
const nativeError = { code: 42, message: 'Simulated', readableErrorCode: 'TEST_STORE_SIMULATED_PURCHASE_ERROR' };

function start(identifier = 'upgrade', errorPresenter: jest.Mock = jest.fn()) {
  const onPassed = jest.fn();
  const onFinished = jest.fn();
  const cancel = checkpoint(identifier, onPassed, {
    customVariables: { name: CustomVariableValue.string('Taylor'), level: CustomVariableValue.number(2) },
    errorPresenter,
    onFinished,
  });
  return { cancel, onPassed, onError: errorPresenter, onFinished };
}

beforeEach(() => {
  mockPlatform.OS = 'ios';
  mockPlatform.Version = '18.0';
  mockPreview = false;
  mockListeners.clear();
  jest.clearAllMocks();
});

it('starts natively with converted custom variables and a per-call id', () => {
  start();
  expect(mockNative.checkpointEmbedded).toHaveBeenCalledWith('upgrade', { name: 'Taylor', level: 2 }, expect.any(String), true);
  expect(listenerCount()).toBe(1);
});

it('routes passed, then finished, exactly once for its own call and keeps other calls separate', () => {
  const first = start('first');
  const second = start('second');
  emit({ callId: 'unrelated', type: 'passed', result });
  emit({ callId: callId(0), type: 'passed', result });
  emit({ callId: callId(0), type: 'passed', result });
  expect(first.onPassed).toHaveBeenCalledTimes(1);
  expect(first.onPassed).toHaveBeenCalledWith(result);
  expect(first.onFinished).not.toHaveBeenCalled();
  expect(second.onPassed).not.toHaveBeenCalled();
  emit({ callId: callId(0), type: 'finished' });
  emit({ callId: callId(0), type: 'finished' });
  expect(first.onFinished).toHaveBeenCalledTimes(1);
  expect(listenerCount()).toBe(1);
  emit({ callId: callId(1), type: 'finished' });
  expect(second.onPassed).not.toHaveBeenCalled();
  expect(second.onFinished).toHaveBeenCalledTimes(1);
  expect(listenerCount()).toBe(0);
});

it('surfaces each native error once and acknowledges it natively only when the app completes it', () => {
  const { onError } = start();
  emit({ callId: callId(0), type: 'error', requestId: 'r1', kind: 'flowActionFailed', error: nativeError });
  emit({ callId: callId(0), type: 'error', requestId: 'r1', kind: 'flowActionFailed', error: nativeError });
  expect(onError).toHaveBeenCalledTimes(1);
  const request: CheckpointErrorRequest = onError.mock.calls[0]![0];
  expect(request.requestId).toBe('r1');
  expect(request.kind).toBe('flowActionFailed');
  expect(request.error.code).toBe('42');
  expect(request.error.message).toBe('Simulated');
  expect(request.error.readableErrorCode).toBe('TEST_STORE_SIMULATED_PURCHASE_ERROR');
  expect(mockNative.completeEmbeddedError).not.toHaveBeenCalled();
  request.complete();
  request.complete();
  expect(mockNative.completeEmbeddedError).toHaveBeenCalledTimes(1);
  expect(mockNative.completeEmbeddedError).toHaveBeenCalledWith(callId(0), 'r1');
});

it('ignores stale replies and events after the call finished', () => {
  const { onError, onPassed, onFinished } = start();
  emit({ callId: callId(0), type: 'error', requestId: 'r1', kind: 'flowCouldNotBeShown', error: nativeError });
  const request: CheckpointErrorRequest = onError.mock.calls[0]![0];
  emit({ callId: callId(0), type: 'finished' });
  request.complete();
  emit({ callId: callId(0), type: 'passed', result });
  emit({ callId: callId(0), type: 'error', requestId: 'r2', kind: 'flowActionFailed', error: nativeError });
  expect(mockNative.completeEmbeddedError).not.toHaveBeenCalled();
  expect(onPassed).not.toHaveBeenCalled();
  expect(onError).toHaveBeenCalledTimes(1);
  expect(onFinished).toHaveBeenCalledTimes(1);
});

it('cancels natively once and still waits for the native finished event', () => {
  const { cancel, onFinished } = start();
  cancel();
  cancel();
  expect(mockNative.cancelEmbedded).toHaveBeenCalledTimes(1);
  expect(mockNative.cancelEmbedded).toHaveBeenCalledWith(callId(0));
  expect(onFinished).not.toHaveBeenCalled();
  expect(listenerCount()).toBe(1);
  emit({ callId: callId(0), type: 'finished' });
  expect(onFinished).toHaveBeenCalledTimes(1);
  expect(listenerCount()).toBe(0);
  cancel();
  expect(mockNative.cancelEmbedded).toHaveBeenCalledTimes(1);
});

it('removes the listener if invoking native code fails', () => {
  mockNative.checkpointEmbedded!.mockImplementationOnce(() => { throw new Error('bridge unavailable'); });
  expect(() => start()).toThrow('bridge unavailable');
  expect(listenerCount()).toBe(0);
});

it('rejects builds without the experimental native method', () => {
  const method = mockNative.checkpointEmbedded!;
  delete mockNative.checkpointEmbedded;
  try {
    expect(() => start()).toThrow(/local purchases-ios/);
  } finally {
    mockNative.checkpointEmbedded = method;
  }
});

it.each(['web', 'android', 'preview', 'ios13'])('rejects unsupported environment %s', environment => {
  if (environment === 'web') mockPlatform.OS = 'web';
  if (environment === 'android') mockPlatform.OS = 'android';
  if (environment === 'preview') mockPreview = true;
  if (environment === 'ios13') mockPlatform.Version = '13.0';
  expect(() => start()).toThrow(/require/);
  expect(mockNative.checkpointEmbedded).not.toHaveBeenCalled();
  expect(listenerCount()).toBe(0);
});

it('always embeds on iOS, without a JS error presenter when none is given', () => {
  const onFinished = jest.fn();
  const cancel = checkpoint('upgrade', jest.fn(), { onFinished });
  expect(mockNative.checkpointEmbedded).toHaveBeenCalledWith('upgrade', null, expect.any(String), false);
  expect(mockNative.checkpoint).not.toHaveBeenCalled();
  emit({ callId: callId(0), type: 'error', requestId: 'r1', kind: 'flowActionFailed', error: nativeError });
  expect(mockNative.completeEmbeddedError).not.toHaveBeenCalled();
  emit({ callId: callId(0), type: 'finished' });
  expect(onFinished).toHaveBeenCalledTimes(1);
  cancel();
});

it('keeps the modal path on Android and rejects an errorPresenter there', () => {
  mockPlatform.OS = 'android';
  checkpoint('upgrade', jest.fn());
  expect(mockNative.checkpoint).toHaveBeenCalledTimes(1);
  expect(mockNative.checkpointEmbedded).not.toHaveBeenCalled();
  expect(() => checkpoint('upgrade', jest.fn(), { errorPresenter: jest.fn() })).toThrow(/requires iOS/);
});

it('acknowledges the error when the promise returned by the presenter settles', async () => {
  let resolve!: () => void;
  const { onError } = start('upgrade', jest.fn(() => new Promise<void>(r => { resolve = r; })));
  emit({ callId: callId(0), type: 'error', requestId: 'r1', kind: 'flowActionFailed', error: nativeError });
  expect(onError).toHaveBeenCalledTimes(1);
  expect(mockNative.completeEmbeddedError).not.toHaveBeenCalled();
  resolve();
  await Promise.resolve();
  expect(mockNative.completeEmbeddedError).toHaveBeenCalledTimes(1);
  expect(mockNative.completeEmbeddedError).toHaveBeenCalledWith(callId(0), 'r1');
});

it('still acknowledges when the presenter rejects or throws, so the flow is never left blocked', async () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  start('rejects', jest.fn(() => Promise.reject(new Error('boom'))));
  emit({ callId: callId(0), type: 'error', requestId: 'r1', kind: 'flowActionFailed', error: nativeError });
  await Promise.resolve();
  await Promise.resolve();
  expect(mockNative.completeEmbeddedError).toHaveBeenCalledWith(callId(0), 'r1');

  start('throws', jest.fn(() => { throw new Error('boom'); }));
  emit({ callId: callId(1), type: 'error', requestId: 'r2', kind: 'flowActionFailed', error: nativeError });
  expect(mockNative.completeEmbeddedError).toHaveBeenCalledWith(callId(1), 'r2');
  warn.mockRestore();
});

it('does not acknowledge twice when the presenter completes and also returns a promise', async () => {
  start('upgrade', jest.fn((request: CheckpointErrorRequest) => { request.complete(); return Promise.resolve(); }));
  emit({ callId: callId(0), type: 'error', requestId: 'r1', kind: 'flowActionFailed', error: nativeError });
  await Promise.resolve();
  expect(mockNative.completeEmbeddedError).toHaveBeenCalledTimes(1);
});
