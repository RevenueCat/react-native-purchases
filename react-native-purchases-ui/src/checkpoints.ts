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

export interface CheckpointParams {
  customVariables?: CustomVariables;
  presentationMode?: FLOW_PRESENTATION_MODE;
  /**
   * Supplies the content of the native error dialog. Called once per error. Return `null` to use the SDK's
   * default dialog. The SDK also shows its default dialog if the factory throws, returns invalid content, or
   * takes longer than 5 seconds to answer.
   */
  errorDialogFactory?: (error: CheckpointError) => CheckpointErrorDialog | null | Promise<CheckpointErrorDialog | null>;
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

function toErrorDialog(value: unknown): CheckpointErrorDialog | null {
  if (value === null || value === undefined) {
    return null;
  }
  const { message, buttonTitle } = value as Partial<CheckpointErrorDialog>;
  if (typeof message !== 'string' || typeof buttonTitle !== 'string') {
    throw new Error('errorDialogFactory must return null or an object with string message and buttonTitle.');
  }
  return { message, buttonTitle };
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
      let dialog: CheckpointErrorDialog | null = null;
      try {
        dialog = toErrorDialog(await errorDialogFactory(event.error));
      } catch (error) {
        console.warn('[RevenueCatUI] Using the default checkpoint error dialog because errorDialogFactory failed:', error);
      }
      if (!detached) {
        native.resolveErrorDialog(event.requestId, dialog);
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
