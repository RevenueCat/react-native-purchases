import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import {
  normalizePurchasesError,
  type CustomerInfo,
  type PurchasesEntitlementInfo,
  type PurchasesError,
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

export interface CheckpointParams {
  customVariables?: CustomVariables;
  presentationMode?: FLOW_PRESENTATION_MODE;
}

export enum CHECKPOINT_FAILURE_KIND {
  FLOW_COULD_NOT_BE_SHOWN = 'FLOW_COULD_NOT_BE_SHOWN',
  FLOW_ACTION_FAILED = 'FLOW_ACTION_FAILED',
  FLOW_RESULT_SYNC_FAILED = 'FLOW_RESULT_SYNC_FAILED',
}

export interface ErrorPresentationParams {
  checkpointIdentifier: string;
  error: PurchasesError;
  customVariables: CustomVariables;
  kind: CHECKPOINT_FAILURE_KIND;
}

export interface ErrorPresentationCompletion {
  /** Call after the error UI has finished dismissing. Later calls are ignored. */
  complete(): void;
}

/** The SDK chooses how the flow proceeds after error presentation completes. */
export type ErrorPresenter = (params: ErrorPresentationParams, completion: ErrorPresentationCompletion) => void;

const PASSED_EVENT = 'Checkpoints-onPassed';
const ERROR_EVENT = 'Checkpoints-onError';
let nextCallId = 0;
const callIdPrefix = `${Date.now()}-${Math.random()}`;
let errorSubscription: { remove(): void } | undefined;

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
  const subscription = emitter.addListener(PASSED_EVENT, event => {
    if (event.callId !== callId) {
      return;
    }
    subscription.remove();
    onPassed(event.result);
  });
  try {
    native.checkpoint(identifier, convertCustomVariablesToNativeMap(params.customVariables),
      params.presentationMode ?? FLOW_PRESENTATION_MODE.DEFAULT, callId);
  } catch (error) {
    subscription.remove();
    throw error;
  }
  return () => subscription.remove();
}

/**
 * Installs an error presenter for subsequent checkpoint calls. Pass null to restore native
 * error UI. Replacing or removing a presenter completes its pending error presentation.
 * Render custom iOS error UI inside PaywallPortal so it can appear above the native flow.
 */
export function setErrorPresenter(presenter: ErrorPresenter | null): void {
  const native = nativeCheckpoints();
  errorSubscription?.remove();
  errorSubscription = undefined;
  if (presenter) {
    errorSubscription = new NativeEventEmitter(native).addListener(ERROR_EVENT, event => {
      const { requestId, ...params } = event;
      normalizePurchasesError(params.error);
      const customVariables: CustomVariables = {};
      for (const key of Object.keys(params.customVariables)) {
        const value = params.customVariables[key];
        if (typeof value === 'string') {
          customVariables[key] = CustomVariableValue.string(value);
        }
        if (typeof value === 'number') {
          customVariables[key] = CustomVariableValue.number(value);
        }
        if (typeof value === 'boolean') {
          customVariables[key] = CustomVariableValue.boolean(value);
        }
      }
      let completed = false;
      const completion = {
        complete: () => {
          if (completed) {
            return;
          }
          completed = true;
          native.completeErrorPresentation(requestId);
        },
      };
      try {
        presenter({ ...params, customVariables }, completion);
      } catch (error) {
        completion.complete();
        throw error;
      }
    });
  }
  try {
    native.setErrorPresenterEnabled(presenter !== null);
  } catch (error) {
    errorSubscription?.remove();
    errorSubscription = undefined;
    throw error;
  }
}
