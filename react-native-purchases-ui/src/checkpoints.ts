import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import {
  type CustomerInfo,
  type PurchasesEntitlementInfo,
  type PurchasesStoreProduct,
} from '@revenuecat/purchases-typescript-internal';
import { convertCustomVariablesToNativeMap, type CustomVariables } from './customVariables';
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
  buttonTitle: string;
}

/** What to do with a checkpoint error. The SDK owns dialog presentation and acknowledgement. */
export type CheckpointErrorDialogOutcome =
  | { type: 'show'; dialog: CheckpointErrorDialog }
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
}

const PASSED_EVENT = 'Checkpoints-onPassed';
const ERROR_DIALOG_REQUESTED_EVENT = 'Checkpoints-onErrorDialogRequested';
let nextCallId = 0;
const callIdPrefix = `${Date.now()}-${Math.random()}`;

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
      const { message, buttonTitle } = outcome.dialog as Partial<CheckpointErrorDialog>;
      if (typeof message === 'string' && message.length > 0 &&
          typeof buttonTitle === 'string' && buttonTitle.length > 0) {
        return { type: 'show', dialog: { message, buttonTitle } };
      }
    }
  }
  throw new Error('errorDialogFactory must return a show outcome with non-empty message and buttonTitle, useDefault, or suppress.');
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
  const emitter = new NativeEventEmitter(native);
  const errorDialogFactory = params.errorDialogFactory;
  let detached = false;
  const subscriptions: Array<{ remove: () => void }> = [];
  const removeSubscriptions = () => subscriptions.splice(0).forEach(subscription => subscription.remove());

  subscriptions.push(emitter.addListener(PASSED_EVENT, event => {
    if (event.callId !== callId) {
      return;
    }
    removeSubscriptions();
    onPassed(event.result);
  }));
  if (errorDialogFactory) {
    subscriptions.push(emitter.addListener(ERROR_DIALOG_REQUESTED_EVENT, async event => {
      if (event.callId !== callId) {
        return;
      }
      let outcome: CheckpointErrorDialogOutcome = { type: 'useDefault' };
      try {
        outcome = toErrorDialogOutcome(await errorDialogFactory(event.error));
      } catch (error) {
        // tslint:disable-next-line:no-console
        console.warn('[RevenueCatUI] Using the default checkpoint error dialog because errorDialogFactory failed:', error);
      }
      if (!detached) {
        native.resolveErrorDialog(event.requestId, outcome);
      }
    }));
  }
  try {
    native.checkpoint(identifier, convertCustomVariablesToNativeMap(params.customVariables),
      params.presentationMode ?? FLOW_PRESENTATION_MODE.DEFAULT, callId, errorDialogFactory !== undefined);
  } catch (error) {
    removeSubscriptions();
    throw error;
  }
  return () => {
    removeSubscriptions();
    if (errorDialogFactory && !detached) {
      native.detachErrorDialogFactory(callId);
    }
    detached = true;
  };
}
