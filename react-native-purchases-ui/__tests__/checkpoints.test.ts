type Listener = (event: any) => void;
const mockListeners = new Map<string, Set<Listener>>();
const mockNative = {
  checkpoint: jest.fn(),
  resolveErrorDialog: jest.fn(),
  detachErrorDialogFactory: jest.fn(),
  detachPaywallPresenter: jest.fn(),
  completePaywallPresentation: jest.fn(),
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

import { checkpoint, FLOW_PRESENTATION_MODE, PAYWALL_PRESENTATION_RESULT, setPaywallPresenter } from '../src/checkpoints';
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
  setPaywallPresenter(null);
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
    { name: 'Taylor', level: 12, premium: false }, 'MODAL_FULL_SCREEN', expect.any(String), false, false);
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

it('removes all subscriptions only for the checkpoint that reports a terminal error', () => {
  const failed = jest.fn();
  const passed = jest.fn();
  const params = {
    paywallPresenter: jest.fn(),
    errorDialogFactory: jest.fn(),
  };
  checkpoint('first', failed, params);
  checkpoint('second', passed, params);
  const events = [
    'Checkpoints-onPassed', 'Checkpoints-onError',
    'Checkpoints-onErrorDialogRequested', 'Checkpoints-onPaywallPresentation',
  ];
  events.forEach(event => expect(listenerCount(event)).toBe(2));

  emit('Checkpoints-onError', { callId: 'unrelated' });
  events.forEach(event => expect(listenerCount(event)).toBe(2));
  emit('Checkpoints-onError', { callId: callId(0) });
  events.forEach(event => expect(listenerCount(event)).toBe(1));
  emit('Checkpoints-onPassed', { callId: callId(0), result });
  expect(failed).not.toHaveBeenCalled();

  emit('Checkpoints-onPassed', { callId: callId(1), result });
  expect(passed).toHaveBeenCalledWith(result);
  events.forEach(event => expect(listenerCount(event)).toBe(0));
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
  const dialog = { message: 'Try again later', primaryButtonTitle: 'Got it' };
  const nativeOutcome = (outcome: any) => outcome.type === 'show'
    ? { type: 'show', dialog: { message: outcome.dialog.message, buttonTitle: outcome.dialog.primaryButtonTitle } }
    : outcome;
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

  it.each([
    { type: 'show', dialog },
    { type: 'useDefault' },
    { type: 'suppress' },
  ])('answers with the explicit $type outcome', async outcome => {
    const factory = jest.fn().mockReturnValue({ ...outcome, ignored: true });
    checkpoint('upgrade', jest.fn(), { errorDialogFactory: factory });
    expect(mockNative.checkpoint.mock.calls[0]![4]).toBe(true);
    emit(REQUESTED, { callId: callId(0), requestId: 'r1', error });
    await flush();
    expect(factory).toHaveBeenCalledWith(error);
    expect(mockNative.resolveErrorDialog).toHaveBeenCalledTimes(1);
    expect(mockNative.resolveErrorDialog).toHaveBeenCalledWith('r1', nativeOutcome(outcome));
    expect(warn).not.toHaveBeenCalled();
  });

  it.each([
    { type: 'show', dialog },
    { type: 'useDefault' },
    { type: 'suppress' },
  ])('awaits asynchronous $type outcomes', async outcome => {
    let resolve: (value: any) => void = () => {};
    checkpoint('upgrade', jest.fn(), {
      errorDialogFactory: () => new Promise<any>(r => { resolve = r; }),
    });
    request(1, 'r1');
    await flush();
    expect(mockNative.resolveErrorDialog).not.toHaveBeenCalled();

    resolve(outcome);
    await flush();

    expect(mockNative.resolveErrorDialog).toHaveBeenCalledTimes(1);
    expect(mockNative.resolveErrorDialog).toHaveBeenCalledWith('r1', nativeOutcome(outcome));
  });

  it('strips extra properties from custom dialog content', async () => {
    checkpoint('upgrade', jest.fn(), {
      errorDialogFactory: () => ({ type: 'show', dialog: { ...dialog, ignored: true } }),
    });
    request(1, 'r1');
    await flush();
    expect(mockNative.resolveErrorDialog).toHaveBeenCalledWith('r1', {
      type: 'show', dialog: { message: dialog.message, buttonTitle: dialog.primaryButtonTitle },
    });
  });

  it.each([
    ['throws', () => { throw new Error('boom'); }],
    ['rejects', () => Promise.reject(new Error('boom'))],
    ['returns null', () => null],
    ['returns undefined', () => undefined],
    ['returns a non-object', () => 'oops'],
    ['returns an unknown outcome', () => ({ type: 'unknown' })],
    ['returns no dialog', () => ({ type: 'show' })],
    ['returns a null dialog', () => ({ type: 'show', dialog: null })],
    ['returns no primary button title', () => ({ type: 'show', dialog: { message: 'x' } })],
    ['returns a non-string message', () => ({ type: 'show', dialog: { message: 1, primaryButtonTitle: 'OK' } })],
    ['returns an empty message', () => ({ type: 'show', dialog: { message: '', primaryButtonTitle: 'OK' } })],
    ['returns an empty primary button title', () => ({ type: 'show', dialog: { message: 'Oops', primaryButtonTitle: '' } })],
  ])('answers useDefault and warns when the factory %s', async (_name, factory) => {
    checkpoint('upgrade', jest.fn(), { errorDialogFactory: factory as any });
    request(1, 'r1');
    await flush();
    expect(mockNative.resolveErrorDialog).toHaveBeenCalledTimes(1);
    expect(mockNative.resolveErrorDialog).toHaveBeenCalledWith('r1', { type: 'useDefault' });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toMatch(/\[RevenueCatUI\]/);
  });

  it('ignores requests addressed to another checkpoint call', async () => {
    const factory = jest.fn().mockReturnValue({ type: 'show', dialog });
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
    resolvers[1]!({ type: 'show', dialog: { message: 'second', primaryButtonTitle: 'OK' } });
    resolvers[0]!({ type: 'show', dialog: { message: 'first', primaryButtonTitle: 'OK' } });
    await flush();
    expect(mockNative.resolveErrorDialog.mock.calls).toEqual([
      ['r2', { type: 'show', dialog: { message: 'second', buttonTitle: 'OK' } }],
      ['r1', { type: 'show', dialog: { message: 'first', buttonTitle: 'OK' } }],
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
    resolve({ type: 'show', dialog });
    await flush();
    expect(mockNative.resolveErrorDialog).not.toHaveBeenCalled();
    request(2, 'r2');
    await flush();
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('stops listening for requests once the checkpoint passes', () => {
    checkpoint('upgrade', jest.fn(), { errorDialogFactory: () => ({ type: 'show', dialog }) });
    expect(listenerCount(REQUESTED)).toBe(1);
    emit('Checkpoints-onPassed', { callId: callId(0), result });
    expect(listenerCount(REQUESTED)).toBe(0);
  });

  it('removes both listeners if invoking native code fails', () => {
    mockNative.checkpoint.mockImplementationOnce(() => { throw new Error('bridge unavailable'); });
    expect(() => checkpoint('upgrade', jest.fn(), { errorDialogFactory: () => ({ type: 'show', dialog }) })).toThrow('bridge unavailable');
    expect(listenerCount(REQUESTED)).toBe(0);
    expect(listenerCount('Checkpoints-onPassed')).toBe(0);
  });
});


describe('paywallPresenter', () => {
  const PRESENT = 'Checkpoints-onPaywallPresentation';
  const offering = { identifier: 'premium', availablePackages: [] };
  const params = {
    checkpointIdentifier: 'upgrade',
    customVariables: { name: 'Taylor', level: 12, premium: false },
    presentationMode: 'MODAL_SHEET',
    offering,
  };
  const present = (requestId = 'p1', index = 0) =>
    emit(PRESENT, { callId: callId(index), requestId, params });

  it('uses the per-call presenter ahead of the global presenter and converts its parameters', () => {
    const global = jest.fn();
    const local = jest.fn();
    setPaywallPresenter(global);
    checkpoint('upgrade', jest.fn(), { paywallPresenter: local });
    present();
    expect(mockNative.checkpoint.mock.calls[0]![5]).toBe(true);
    expect(local).toHaveBeenCalledWith({
      ...params,
      customVariables: {
        name: CustomVariableValue.string('Taylor'),
        level: CustomVariableValue.number(12),
        premium: CustomVariableValue.boolean(false),
      },
    }, expect.any(Function));
    expect(global).not.toHaveBeenCalled();
  });

  it('captures the global presenter per call and restores the native presenter with null', () => {
    const presenter = jest.fn();
    setPaywallPresenter(presenter);
    checkpoint('upgrade', jest.fn());
    setPaywallPresenter(null);
    checkpoint('native', jest.fn());
    present();
    expect(presenter).toHaveBeenCalledTimes(1);
    expect(mockNative.checkpoint.mock.calls.map(call => call[5])).toEqual([true, false]);
  });

  it('uses the native presenter for a null override without changing the global default', () => {
    const global = jest.fn();
    setPaywallPresenter(global);
    const remove = checkpoint('native', jest.fn(), { paywallPresenter: null });
    expect(mockNative.checkpoint.mock.calls[0]![5]).toBe(false);
    expect(listenerCount(PRESENT)).toBe(0);
    remove();
    expect(mockNative.detachPaywallPresenter).not.toHaveBeenCalled();

    checkpoint('global', jest.fn(), { paywallPresenter: undefined });
    expect(mockNative.checkpoint.mock.calls[1]![5]).toBe(true);
    present('p2', 1);
    expect(global).toHaveBeenCalledTimes(1);
  });

  it('keeps the selected global presenter when the default changes before presentation', () => {
    const first = jest.fn();
    const second = jest.fn();
    setPaywallPresenter(first);
    checkpoint('first', jest.fn());
    setPaywallPresenter(second);
    checkpoint('second', jest.fn());
    present('p1', 0);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
    present('p2', 1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('routes concurrent presentation requests to their owning calls', () => {
    const first = jest.fn();
    const second = jest.fn();
    checkpoint('upgrade', jest.fn(), { paywallPresenter: first });
    checkpoint('upgrade', jest.fn(), { paywallPresenter: second });
    present('p2', 1);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it.each(Object.values(PAYWALL_PRESENTATION_RESULT))('reports %s only once without passing early', outcome => {
    const passed = jest.fn();
    const presenter = jest.fn();
    checkpoint('upgrade', passed, { paywallPresenter: presenter });
    present();
    const complete = presenter.mock.calls[0]![1];
    complete(outcome);
    complete(PAYWALL_PRESENTATION_RESULT.NAVIGATED_BACK);
    expect(mockNative.completePaywallPresentation.mock.calls).toEqual([['p1', outcome]]);
    expect(passed).not.toHaveBeenCalled();
    if (outcome !== PAYWALL_PRESENTATION_RESULT.NAVIGATED_BACK) {
      emit('Checkpoints-onPassed', { callId: callId(0), result });
      expect(passed).toHaveBeenCalledWith(result);
    } else {
      expect(listenerCount(PRESENT)).toBe(0);
    }
  });

  it('finishes a throwing presenter as navigated back', () => {
    checkpoint('upgrade', jest.fn(), { paywallPresenter: () => { throw new Error('render failed'); } });
    present();
    expect(mockNative.completePaywallPresentation).toHaveBeenCalledWith('p1', 'NAVIGATED_BACK');
    expect(listenerCount(PRESENT)).toBe(0);
  });

  it('finishes a rejected async presenter as navigated back', async () => {
    checkpoint('upgrade', jest.fn(), { paywallPresenter: async () => { throw new Error('navigation failed'); } });
    present();
    await new Promise(resolve => setImmediate(resolve));
    expect(mockNative.completePaywallPresentation).toHaveBeenCalledWith('p1', 'NAVIGATED_BACK');
  });

  it('waits for the explicit completion after an async presenter resolves', async () => {
    checkpoint('upgrade', jest.fn(), { paywallPresenter: async () => {} });
    present();
    await new Promise(resolve => setImmediate(resolve));
    expect(mockNative.completePaywallPresentation).not.toHaveBeenCalled();
  });

  it('keeps an explicit completion when the async presenter subsequently rejects', async () => {
    checkpoint('upgrade', jest.fn(), {
      paywallPresenter: async (_params, complete) => {
        complete(PAYWALL_PRESENTATION_RESULT.CONTINUED);
        throw new Error('navigation failed after completion');
      },
    });
    present();
    await new Promise(resolve => setImmediate(resolve));
    expect(mockNative.completePaywallPresentation.mock.calls).toEqual([['p1', 'CONTINUED']]);
  });

  it('detaches future native presentation when removed before the offering resolves', () => {
    const presenter = jest.fn();
    const remove = checkpoint('upgrade', jest.fn(), { paywallPresenter: presenter });
    remove();
    remove();
    expect(mockNative.detachPaywallPresenter.mock.calls).toEqual([[callId(0), null]]);
    present();
    expect(presenter).not.toHaveBeenCalled();
    expect(listenerCount(PRESENT)).toBe(0);
  });

  it('lets an already shown paywall complete after the owning screen unmounts', () => {
    const presenter = jest.fn();
    const passed = jest.fn();
    const remove = checkpoint('upgrade', passed, { paywallPresenter: presenter });
    present();
    remove();
    expect(mockNative.detachPaywallPresenter).toHaveBeenCalledWith(callId(0), 'p1');
    presenter.mock.calls[0]![1](PAYWALL_PRESENTATION_RESULT.CONTINUED);
    expect(mockNative.completePaywallPresentation).toHaveBeenCalledWith('p1', 'CONTINUED');
    emit('Checkpoints-onPassed', { callId: callId(0), result });
    expect(passed).not.toHaveBeenCalled();
  });

  it('still answers a sync error after completing custom presentation', async () => {
    const factory = jest.fn().mockReturnValue({ type: 'suppress' });
    checkpoint('upgrade', jest.fn(), {
      paywallPresenter: (_params, complete) => complete(PAYWALL_PRESENTATION_RESULT.CONTINUED),
      errorDialogFactory: factory,
    });
    present();
    const error = { kind: 'flowResultSyncFailed', code: 10, message: 'offline' };
    emit('Checkpoints-onErrorDialogRequested', { callId: callId(0), requestId: 'e1', error });
    await new Promise(resolve => setImmediate(resolve));
    expect(factory).toHaveBeenCalledWith(error);
    expect(mockNative.resolveErrorDialog).toHaveBeenCalledWith('e1', { type: 'suppress' });
  });
});
