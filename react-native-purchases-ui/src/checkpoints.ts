import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import {
  type CustomerInfo,
  PURCHASES_ERROR_CODE,
  type PurchasesEntitlementInfo,
  type PurchasesError,
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

export interface CheckpointParams {
  customVariables?: CustomVariables;
  presentationMode?: FLOW_PRESENTATION_MODE;
}

const PASSED_EVENT = 'Checkpoints-onPassed';
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

// MARK: - Experimental: SDK-owned embedded checkpoints (iOS only)

/** Why the native SDK asked the app to show an error. */
export type EmbeddedCheckpointErrorKind = 'flowCouldNotBeShown' | 'flowActionFailed' | 'flowResultSyncFailed';

/**
 * An error the native checkpoint wants shown by the app. The flow stays on screen (and blocked) until
 * `complete` is called, so call it only after the app's error UI has fully dismissed.
 */
export interface EmbeddedCheckpointErrorRequest {
  requestId: string;
  kind: EmbeddedCheckpointErrorKind;
  error: PurchasesError;
  /** Acknowledges the error natively. Idempotent. */
  complete: () => void;
}

export interface EmbeddedCheckpointCallbacks {
  /** Same semantics as `checkpoint`'s callback: called only when the app can continue. */
  onPassed: (result: CheckpointResult) => void;
  /** Called for each native error that the app must present above the embedded flow. */
  onError: (request: EmbeddedCheckpointErrorRequest) => void;
  /** Called exactly once on every terminal path, after `onPassed` when it ran. */
  onFinished?: () => void;
}

export interface EmbeddedCheckpointParams {
  customVariables?: CustomVariables;
}

export interface EmbeddedCheckpointHandle {
  /** Cancels resolution or removes the embedded flow. `onPassed` is suppressed; `onFinished` still fires. */
  cancel: () => void;
}

const EMBEDDED_EVENT = 'Checkpoints-embedded';

// PHC ErrorContainer.info is a flat dictionary, unlike RN promise errors.
interface NativeErrorInfo {
  code: number | string;
  message: string;
  readableErrorCode?: string;
  underlyingErrorMessage?: string;
  userCancelled?: boolean | null;
  [key: string]: unknown;
}

interface EmbeddedNativeEvent {
  callId: string;
  type: 'error' | 'passed' | 'finished';
  requestId?: string;
  kind?: EmbeddedCheckpointErrorKind;
  error?: NativeErrorInfo;
  result?: CheckpointResult;
}

function toPurchasesError(error: NativeErrorInfo): PurchasesError {
  const code = String(error.code) as PURCHASES_ERROR_CODE;
  const readableErrorCode = error.readableErrorCode ?? '';
  return {
    code,
    message: error.message,
    readableErrorCode,
    underlyingErrorMessage: error.underlyingErrorMessage ?? '',
    userCancelled: error.userCancelled ?? code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR,
    userInfo: { ...error, readableErrorCode },
  };
}

/**
 * EXPERIMENTAL, iOS only, requires a build against a local purchases-ios with the embedded checkpoint SPI.
 *
 * Runs a checkpoint whose flow the native SDK embeds as a child of the view controller React Native is
 * currently showing (the screen's root or an open `<Modal>`), instead of presenting its own modal. Because no
 * native modal is created, ordinary React Native `<Modal>`s rendered by the app appear above the flow.
 *
 * Workflow execution, purchases, restores, and synchronization stay native. Native close and back navigation
 * remove the child; they never dismiss the containing React Native modal. Cancel from the owning screen's
 * unmount effect.
 */
export function checkpointEmbedded(
  identifier: string,
  callbacks: EmbeddedCheckpointCallbacks,
  params: EmbeddedCheckpointParams = {},
): EmbeddedCheckpointHandle {
  if (Platform.OS !== 'ios') {
    throw new Error('[RevenueCatUI] Embedded checkpoints require iOS.');
  }
  const native = nativeCheckpoints();
  if (typeof native.checkpointEmbedded !== 'function') {
    throw new Error('[RevenueCatUI] Embedded checkpoints require a build against a local purchases-ios with the experimental SPI.');
  }
  const callId = `${callIdPrefix}-${++nextCallId}`;
  const seenRequests = new Set<string>();
  let finished = false;
  let cancelled = false;
  const emitter = new NativeEventEmitter(native);
  const subscription = emitter.addListener(EMBEDDED_EVENT, (event: EmbeddedNativeEvent) => {
    if (event.callId !== callId || finished) {
      return;
    }
    switch (event.type) {
      case 'passed':
        if (seenRequests.has('passed')) {
          return;
        }
        seenRequests.add('passed');
        callbacks.onPassed(event.result as CheckpointResult);
        break;
      case 'error': {
        const requestId = event.requestId;
        if (!requestId || !event.kind || !event.error || seenRequests.has(requestId)) {
          return;
        }
        seenRequests.add(requestId);
        let completed = false;
        callbacks.onError({
          requestId,
          kind: event.kind,
          error: toPurchasesError(event.error),
          complete: () => {
            if (completed || finished) {
              return;
            }
            completed = true;
            native.completeEmbeddedError(callId, requestId);
          },
        });
        break;
      }
      case 'finished':
        finished = true;
        subscription.remove();
        callbacks.onFinished?.();
        break;
    }
  });
  try {
    native.checkpointEmbedded(identifier, convertCustomVariablesToNativeMap(params.customVariables), callId);
  } catch (error) {
    subscription.remove();
    throw error;
  }
  return {
    cancel: () => {
      if (finished || cancelled) {
        return;
      }
      cancelled = true;
      native.cancelEmbedded(callId);
    },
  };
}
