type Listener = (event: any) => void;
const mockListeners = new Map<string, Set<Listener>>();
const mockNative = {
  checkpoint: jest.fn(),
  resolveErrorDialog: jest.fn(),
  detachErrorDialogFactory: jest.fn(),
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

import { checkpoint, FLOW_PRESENTATION_MODE } from '../src/checkpoints';
import { CustomVariableValue } from '../src/customVariables';

const emit = (name: string, event: any) => mockListeners.get(name)?.forEach(listener => listener(event));
const listenerCount = (name: string) => mockListeners.get(name)?.size ?? 0;
const callId = (index: number) => mockNative.checkpoint.mock.calls[index]![3];
const result = { flow: null, customer: { originalAppUserId: 'user' } };

beforeEach(() => {
  mockPlatform.OS = 'ios';
  mockPlatform.Version = '18.0';
  mockPreview = false;
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
    { name: 'Taylor', level: 12, premium: false }, 'MODAL_FULL_SCREEN', expect.any(String), false);
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

describe('errorDialogFactory', () => {
  const REQUESTED = 'Checkpoints-onErrorDialogRequested';
  const error = { kind: 'flowActionFailed', code: 7, message: 'offline' };
  const dialog = { message: 'Try again later', buttonTitle: 'Got it' };
  const request = (index: number, requestId: string, callIndex = 0) =>
    emit(REQUESTED, { callId: callId(callIndex), requestId, error: { ...error, code: index } });
  const flush = () => new Promise(resolve => setImmediate(resolve));
  let warn: jest.SpyInstance;

  beforeEach(() => { warn = jest.spyOn(console, 'warn').mockImplementation(() => {}); });
  afterEach(() => warn.mockRestore());

  it('does not install a request listener or tell native about a factory when none is given', () => {
    const remove = checkpoint('upgrade', jest.fn());
    expect(mockNative.checkpoint.mock.calls[0]![4]).toBe(false);
    expect(listenerCount(REQUESTED)).toBe(0);
    remove();
    expect(mockNative.detachErrorDialogFactory).not.toHaveBeenCalled();
  });

  it('answers a request with the content the factory returns', async () => {
    const factory = jest.fn().mockReturnValue({ ...dialog, ignored: true });
    checkpoint('upgrade', jest.fn(), { errorDialogFactory: factory });
    expect(mockNative.checkpoint.mock.calls[0]![4]).toBe(true);
    emit(REQUESTED, { callId: callId(0), requestId: 'r1', error });
    await flush();
    expect(factory).toHaveBeenCalledWith(error);
    expect(mockNative.resolveErrorDialog).toHaveBeenCalledTimes(1);
    expect(mockNative.resolveErrorDialog).toHaveBeenCalledWith('r1', dialog);
  });

  it('supports asynchronous factories', async () => {
    checkpoint('upgrade', jest.fn(), { errorDialogFactory: async () => dialog });
    request(1, 'r1');
    await flush();
    expect(mockNative.resolveErrorDialog).toHaveBeenCalledWith('r1', dialog);
  });

  it('answers null when the factory returns null', async () => {
    checkpoint('upgrade', jest.fn(), { errorDialogFactory: () => null });
    request(1, 'r1');
    await flush();
    expect(mockNative.resolveErrorDialog).toHaveBeenCalledWith('r1', null);
    expect(warn).not.toHaveBeenCalled();
  });

  it.each([
    ['throws', () => { throw new Error('boom'); }],
    ['rejects', () => Promise.reject(new Error('boom'))],
    ['returns a non-object', () => 'oops'],
    ['returns no button title', () => ({ message: 'x' })],
    ['returns a non-string message', () => ({ message: 1, buttonTitle: 'OK' })],
  ])('answers null and warns when the factory %s', async (_name, factory) => {
    checkpoint('upgrade', jest.fn(), { errorDialogFactory: factory as any });
    request(1, 'r1');
    await flush();
    expect(mockNative.resolveErrorDialog).toHaveBeenCalledTimes(1);
    expect(mockNative.resolveErrorDialog).toHaveBeenCalledWith('r1', null);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toMatch(/\[RevenueCatUI\]/);
  });

  it('ignores requests addressed to another checkpoint call', async () => {
    const factory = jest.fn().mockReturnValue(dialog);
    checkpoint('first', jest.fn(), { errorDialogFactory: factory });
    emit(REQUESTED, { callId: 'unrelated', requestId: 'r1', error });
    await flush();
    expect(factory).not.toHaveBeenCalled();
    expect(mockNative.resolveErrorDialog).not.toHaveBeenCalled();
  });

  it('answers several errors in one flow once each, matched by requestId', async () => {
    const resolvers: Array<(value: any) => void> = [];
    const factory = jest.fn(() => new Promise<any>(resolve => resolvers.push(resolve)));
    checkpoint('upgrade', jest.fn(), { errorDialogFactory: factory });
    request(1, 'r1');
    request(2, 'r2');
    expect(factory.mock.calls.map(call => (call as any)[0].code)).toEqual([1, 2]);
    resolvers[1]!({ message: 'second', buttonTitle: 'OK' });
    resolvers[0]!({ message: 'first', buttonTitle: 'OK' });
    await flush();
    expect(mockNative.resolveErrorDialog.mock.calls).toEqual([
      ['r2', { message: 'second', buttonTitle: 'OK' }],
      ['r1', { message: 'first', buttonTitle: 'OK' }],
    ]);
  });

  it('detaches from native, stops listening and drops a pending answer when removed', async () => {
    let resolve: (value: any) => void = () => {};
    const factory = jest.fn(() => new Promise<any>(r => { resolve = r; }));
    const remove = checkpoint('upgrade', jest.fn(), { errorDialogFactory: factory });
    request(1, 'r1');
    remove();
    expect(mockNative.detachErrorDialogFactory).toHaveBeenCalledWith(callId(0));
    expect(listenerCount(REQUESTED)).toBe(0);
    resolve(dialog);
    await flush();
    expect(mockNative.resolveErrorDialog).not.toHaveBeenCalled();
    request(2, 'r2');
    await flush();
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('stops listening for requests once the checkpoint passes', () => {
    checkpoint('upgrade', jest.fn(), { errorDialogFactory: () => dialog });
    expect(listenerCount(REQUESTED)).toBe(1);
    emit('Checkpoints-onPassed', { callId: callId(0), result });
    expect(listenerCount(REQUESTED)).toBe(0);
  });

  it('removes both listeners if invoking native code fails', () => {
    mockNative.checkpoint.mockImplementationOnce(() => { throw new Error('bridge unavailable'); });
    expect(() => checkpoint('upgrade', jest.fn(), { errorDialogFactory: () => dialog })).toThrow('bridge unavailable');
    expect(listenerCount(REQUESTED)).toBe(0);
    expect(listenerCount('Checkpoints-onPassed')).toBe(0);
  });
});
