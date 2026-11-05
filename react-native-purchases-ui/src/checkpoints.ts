import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import {
  type CustomerInfo,
  type PurchasesEntitlementInfo,
  type PurchasesOffering,
  type PurchasesStoreProduct,
} from '@revenuecat/purchases-typescript-internal';
import { CustomVariableValue, convertCustomVariablesToNativeMap, type CustomVariables } from './customVariables';
import { shouldUsePreviewAPIMode } from './utils/environment';

/** How the SDK presents the flow selected by a checkpoint. */
export enum FLOW_PRESENTATION_MODE {
  DEFAULT = 'DEFAULT',
  MODAL_FULL_SCREEN = 'MODAL_FULL_SCREEN',
  MODAL_SHEET = 'MODAL_SHEET',
}

export interface ObtainedEntitlement {
  entitlementInfo: PurchasesEntitlementInfo;
}

export interface ObtainedProduct {
  product: PurchasesStoreProduct;
}

export interface FlowResult {
  obtainedEntitlements: ObtainedEntitlement[];
  obtainedProducts: ObtainedProduct[];
}

export interface CheckpointResult {
  /** Null when the checkpoint had nothing to present. */
  flow: FlowResult | null;
  /** Customer information after passing the checkpoint. */
  customer: CustomerInfo;
}

/** What kind of failure the native SDK needs an error dialog for. */
export type CheckpointErrorKind = 'flowCouldNotBeShown' | 'flowActionFailed' | 'flowResultSyncFailed';

export interface CheckpointError {
  kind: CheckpointErrorKind;
  code: number;
  message: string;
}

/** The content of the native error dialog. */
export interface CheckpointErrorDialog {
  message: string;
  primaryButtonTitle: string;
}

/** What to do with a checkpoint error. The SDK owns dialog presentation and acknowledgement. */
export type CheckpointErrorDialogOutcome =
  | { type: 'show'; dialog: CheckpointErrorDialog }
  | { type: 'useDefault' }
  | { type: 'suppress' };

/** How an app-owned checkpoint paywall presentation ended. */
export enum PAYWALL_PRESENTATION_RESULT {
  CONTINUED = 'CONTINUED',
  CLOSED = 'CLOSED',
  NAVIGATED_BACK = 'NAVIGATED_BACK',
}

export interface PaywallPresentationParams {
  checkpointIdentifier: string;
  customVariables: CustomVariables;
  presentationMode: FLOW_PRESENTATION_MODE.MODAL_FULL_SCREEN | FLOW_PRESENTATION_MODE.MODAL_SHEET;
  offering: PurchasesOffering;
}

/** Presents a checkpoint-selected offering and reports how the app-owned UI ended. */
export type PaywallPresenter = (
  params: PaywallPresentationParams,
  completion: (result: PAYWALL_PRESENTATION_RESULT) => void,
) => void;

type NativeCheckpointErrorDialogOutcome =
  | { type: 'show'; dialog: { message: string; buttonTitle: string } }
  | { type: 'useDefault' }
  | { type: 'suppress' };

export interface CheckpointParams {
  customVariables?: CustomVariables;
  presentationMode?: FLOW_PRESENTATION_MODE;
  /**
   * Chooses custom dialog content, the SDK's default dialog, or no dialog for each error.
   * May return a promise. The SDK waits for the result; a pending promise delays error handling.
   * Throwing, rejecting, or returning an invalid outcome uses the SDK's default dialog.
   */
  errorDialogFactory?: (error: CheckpointError) => CheckpointErrorDialogOutcome | Promise<CheckpointErrorDialogOutcome>;
  paywallPresenter?: PaywallPresenter;
}

const PASSED_EVENT = 'Checkpoints-onPassed';
const ERROR_DIALOG_REQUESTED_EVENT = 'Checkpoints-onErrorDialogRequested';
const ERROR_EVENT = 'Checkpoints-onError';
const PRESENT_PAYWALL_EVENT = 'Checkpoints-onPaywallPresentation';
let nextCallId = 0;
const callIdPrefix = `${Date.now()}-${Math.random()}`;
let globalPaywallPresenter: PaywallPresenter | null = null;

function nativeCheckpoints() {
  if (shouldUsePreviewAPIMode() || (Platform.OS !== 'ios' && Platform.OS !== 'android')) {
    throw new Error('[RevenueCatUI] Checkpoints require a native iOS or Android development build.');
  }
  if (Platform.OS === 'ios' && parseInt(String(Platform.Version), 10) < 15) {
    throw new Error('[RevenueCatUI] Checkpoints require iOS 15 or later.');
  }
  const native = NativeModules.RNCheckpoints;
  if (!native) {
    throw new Error('[RevenueCatUI] Checkpoint native module not found. Rebuild your app after installing react-native-purchases-ui.');
  }
  return native;
}

function toErrorDialogOutcome(value: unknown): CheckpointErrorDialogOutcome {
  if (typeof value === 'object' && value !== null) {
    const outcome = value as { type?: unknown; dialog?: unknown };
    if (outcome.type === 'useDefault' || outcome.type === 'suppress') {
      return { type: outcome.type };
    }
    if (outcome.type === 'show' && typeof outcome.dialog === 'object' && outcome.dialog !== null) {
      const { message, primaryButtonTitle } = outcome.dialog as Partial<CheckpointErrorDialog>;
      if (typeof message === 'string' && message.length > 0 &&
          typeof primaryButtonTitle === 'string' && primaryButtonTitle.length > 0) {
        return { type: 'show', dialog: { message, primaryButtonTitle } };
      }
    }
  }
  throw new Error('errorDialogFactory must return a show outcome with non-empty message and primaryButtonTitle, useDefault, or suppress.');
}

function toNativeErrorDialogOutcome(outcome: CheckpointErrorDialogOutcome): NativeCheckpointErrorDialogOutcome {
  if (outcome.type !== 'show') {
    return outcome;
  }
  return {
    type: 'show',
    dialog: { message: outcome.dialog.message, buttonTitle: outcome.dialog.primaryButtonTitle },
  };
}

/**
 * Calls onPassed only when the app can continue past the checkpoint. It is not called when
 * the user backs out, a blocking error occurs, or another checkpoint owns presentation.
 * Requires iOS 15+ or Android. Checkpoints are an invite-only API.
 *
 * Returns a function that removes the callback. Call it when the owning screen unmounts;
 * removing the callback does not dismiss a flow already on screen.
 */
export function checkpoint(
  identifier: string,
  onPassed: (result: CheckpointResult) => void,
  params: CheckpointParams = {},
): () => void {
  const native = nativeCheckpoints();
  const callId = `${callIdPrefix}-${++nextCallId}`;
  const paywallPresenter = params.paywallPresenter ?? globalPaywallPresenter;
  const emitter = new NativeEventEmitter(native);
  const errorDialogFactory = params.errorDialogFactory;
  let isCallbackActive = true;
  let detached = false;
  const subscriptions: Array<{ remove: () => void }> = [];
  const removeSubscriptions = () => subscriptions.splice(0).forEach(subscription => subscription.remove());

  subscriptions.push(emitter.addListener(PASSED_EVENT, event => {
    if (event.callId !== callId) return;
    removeSubscriptions();
    if (isCallbackActive) onPassed(event.result);
  }));
  subscriptions.push(emitter.addListener(ERROR_EVENT, event => {
    if (event.callId === callId) removeSubscriptions();
  }));
  if (errorDialogFactory) {
    subscriptions.push(emitter.addListener(ERROR_DIALOG_REQUESTED_EVENT, async event => {
      if (event.callId !== callId) return;
      let outcome: CheckpointErrorDialogOutcome = { type: 'useDefault' };
      try {
        outcome = toErrorDialogOutcome(await errorDialogFactory(event.error));
      } catch (error) {
        // tslint:disable-next-line:no-console
        console.warn('[RevenueCatUI] Using the default checkpoint error dialog because errorDialogFactory failed:', error);
      }
      if (!detached) native.resolveErrorDialog(event.requestId, toNativeErrorDialogOutcome(outcome));
    }));
  }
  if (paywallPresenter) {
    subscriptions.push(emitter.addListener(PRESENT_PAYWALL_EVENT, event => {
      if (event.callId !== callId) return;
      let didComplete = false;
      const customVariables: CustomVariables = {};
      Object.entries(event.params.customVariables ?? {}).forEach(([key, value]) => {
        if (typeof value === 'string') customVariables[key] = CustomVariableValue.string(value);
        else if (typeof value === 'number') customVariables[key] = CustomVariableValue.number(value);
        else if (typeof value === 'boolean') customVariables[key] = CustomVariableValue.boolean(value);
      });
      const complete = (result: PAYWALL_PRESENTATION_RESULT) => {
        if (didComplete) return;
        didComplete = true;
        native.completePaywallPresentation(event.requestId, result);
        if (result === PAYWALL_PRESENTATION_RESULT.NAVIGATED_BACK) removeSubscriptions();
      };
      try {
        paywallPresenter({ ...event.params, customVariables }, complete);
      } catch {
        complete(PAYWALL_PRESENTATION_RESULT.NAVIGATED_BACK);
      }
    }));
  }
  try {
    native.checkpoint(identifier, convertCustomVariablesToNativeMap(params.customVariables),
      params.presentationMode ?? FLOW_PRESENTATION_MODE.DEFAULT, callId,
      errorDialogFactory !== undefined, paywallPresenter != null);
  } catch (error) {
    removeSubscriptions();
    throw error;
  }
  return () => {
    isCallbackActive = false;
    removeSubscriptions();
    if (errorDialogFactory && !detached) {
      native.detachErrorDialogFactory(callId);
    }
    detached = true;
  };
}

/**
 * Sets the default app-owned presenter for checkpoint-selected offerings. A per-checkpoint
 * `paywallPresenter` overrides this handler. Pass `null` to restore the SDK presenter.
 */
export function setPaywallPresenter(presenter: PaywallPresenter | null): void {
  globalPaywallPresenter = presenter;
}
