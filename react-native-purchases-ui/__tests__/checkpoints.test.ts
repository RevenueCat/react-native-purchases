type Listener = (event: any) => void;
const mockListeners = new Map<string, Set<Listener>>();
const mockNative = {
  checkpoint: jest.fn(),
  setErrorPresenterEnabled: jest.fn(),
  completeErrorPresentation: jest.fn(),
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

import { checkpoint, CHECKPOINT_FAILURE_KIND, FLOW_PRESENTATION_MODE, setErrorPresenter } from '../src/checkpoints';
import { CustomVariableValue } from '../src/customVariables';

const emit = (name: string, event: any) => mockListeners.get(name)?.forEach(listener => listener(event));
const listenerCount = (name: string) => mockListeners.get(name)?.size ?? 0;
const callId = (index: number) => mockNative.checkpoint.mock.calls[index]![3];
const result = { flow: null, customer: { originalAppUserId: 'user' } };

beforeEach(() => {
  mockPlatform.OS = 'ios';
  mockPlatform.Version = '18.0';
  mockPreview = false;
  setErrorPresenter(null);
  mockListeners.clear();
  jest.clearAllMocks();
});

it('preserves typed custom variables and the presentation mode', () => {
  const remove = checkpoint('upgrade', jest.fn(), {
    customVariables: {
      name: CustomVariableValue.string('Taylor'),
      level: CustomVariableValue.number(12),
      premium: CustomVariableValue.boolean(false),
    },
    presentationMode: FLOW_PRESENTATION_MODE.MODAL_FULL_SCREEN,
  });
  expect(mockNative.checkpoint).toHaveBeenCalledWith('upgrade',
    { name: 'Taylor', level: 12, premium: false }, 'MODAL_FULL_SCREEN', expect.any(String));
  remove();
});

it('routes each result once and removes its listener before calling the app', () => {
  const first = jest.fn();
  const second = jest.fn();
  checkpoint('first', first);
  checkpoint('second', second);
  expect(mockNative.checkpoint.mock.calls[0]!.slice(0, 3)).toEqual(['first', null, 'DEFAULT']);
  emit('Checkpoints-onPassed', { callId: 'unrelated', result });
  expect(first).not.toHaveBeenCalled();
  emit('Checkpoints-onPassed', { callId: callId(0), result });
  emit('Checkpoints-onPassed', { callId: callId(0), result });
  expect(first).toHaveBeenCalledTimes(1);
  expect(first).toHaveBeenCalledWith(result);
  expect(second).not.toHaveBeenCalled();
  expect(listenerCount('Checkpoints-onPassed')).toBe(1);
  emit('Checkpoints-onPassed', { callId: callId(1), result });
  expect(second).toHaveBeenCalledWith(result);
  expect(listenerCount('Checkpoints-onPassed')).toBe(0);
});

it('lets an unmounted screen stop receiving results without passing the checkpoint', () => {
  const passed = jest.fn();
  const remove = checkpoint('upgrade', passed);
  remove();
  remove();
  emit('Checkpoints-onPassed', { callId: callId(0), result });
  expect(passed).not.toHaveBeenCalled();
  expect(listenerCount('Checkpoints-onPassed')).toBe(0);
});

it('removes the listener if invoking native code fails', () => {
  mockNative.checkpoint.mockImplementationOnce(() => { throw new Error('bridge unavailable'); });
  expect(() => checkpoint('upgrade', jest.fn())).toThrow('bridge unavailable');
  expect(listenerCount('Checkpoints-onPassed')).toBe(0);
});

it('does not pass automatically when no native result arrives', () => {
  const passed = jest.fn();
  const remove = checkpoint('upgrade', passed);
  expect(passed).not.toHaveBeenCalled();
  remove();
});

it.each(['web', 'preview', 'ios13'])('rejects unsupported environment %s without installing listeners', environment => {
  if (environment === 'web') mockPlatform.OS = 'web';
  if (environment === 'preview') mockPreview = true;
  if (environment === 'ios13') mockPlatform.Version = '13.0';
  expect(() => checkpoint('upgrade', jest.fn())).toThrow(/Checkpoints require/);
  expect(mockNative.checkpoint).not.toHaveBeenCalled();
  expect(listenerCount('Checkpoints-onPassed')).toBe(0);
});

const errorEvent = () => ({
  requestId: 'error-1', checkpointIdentifier: 'upgrade',
  error: { code: 2, message: 'Store unavailable' },
  kind: CHECKPOINT_FAILURE_KIND.FLOW_ACTION_FAILED,
  customVariables: { level: 12 },
});

it('normalizes errors, preserves context and completes exactly once after the app asks', () => {
  const presenter = jest.fn();
  setErrorPresenter(presenter);
  expect(mockNative.setErrorPresenterEnabled).toHaveBeenLastCalledWith(true);
  emit('Checkpoints-onError', errorEvent());
  expect(presenter).toHaveBeenCalledWith({
    checkpointIdentifier: 'upgrade', error: expect.objectContaining({ code: '2', message: 'Store unavailable' }),
    kind: 'FLOW_ACTION_FAILED', customVariables: { level: CustomVariableValue.number(12) },
  }, expect.objectContaining({ complete: expect.any(Function) }));
  expect(mockNative.completeErrorPresentation).not.toHaveBeenCalled();
  const completion = presenter.mock.calls[0]![1];
  completion.complete();
  completion.complete();
  expect(mockNative.completeErrorPresentation).toHaveBeenCalledTimes(1);
  expect(mockNative.completeErrorPresentation).toHaveBeenCalledWith('error-1');
});

it('replaces and removes presenters without retaining listeners', () => {
  const first = jest.fn();
  const second = jest.fn();
  setErrorPresenter(first);
  setErrorPresenter(second);
  expect(listenerCount('Checkpoints-onError')).toBe(1);
  emit('Checkpoints-onError', errorEvent());
  expect(first).not.toHaveBeenCalled();
  expect(second).toHaveBeenCalledTimes(1);
  setErrorPresenter(null);
  expect(mockNative.setErrorPresenterEnabled).toHaveBeenLastCalledWith(false);
  expect(listenerCount('Checkpoints-onError')).toBe(0);
});

it('releases native error handling when the app presenter throws', () => {
  setErrorPresenter(() => { throw new Error('app error'); });
  expect(() => emit('Checkpoints-onError', errorEvent())).toThrow('app error');
  expect(mockNative.completeErrorPresentation).toHaveBeenCalledWith('error-1');
});

it('removes the error listener if registering the native presenter fails', () => {
  mockNative.setErrorPresenterEnabled.mockImplementationOnce(() => { throw new Error('bridge unavailable'); });
  expect(() => setErrorPresenter(jest.fn())).toThrow('bridge unavailable');
  expect(listenerCount('Checkpoints-onError')).toBe(0);
});
