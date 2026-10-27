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

/** Why the native SDK asked the app to show an error. */
export type CheckpointErrorKind = 'flowCouldNotBeShown' | 'flowActionFailed' | 'flowResultSyncFailed';

/**
 * An error the native checkpoint wants shown by the app. The flow stays on screen (and blocked) until it is
 * completed: return a promise from the error presenter, or call `complete` once the app's error UI has fully
 * dismissed.
 */
export interface CheckpointErrorRequest {
  requestId: string;
  kind: CheckpointErrorKind;
  error: PurchasesError;
  /** Acknowledges the error natively. Idempotent. */
  complete: () => void;
}

export interface CheckpointParams {
  customVariables?: CustomVariables;
  /**
   * How the SDK presents the flow on Android. Ignored on iOS: the flow is embedded in the view controller React
   * Native is currently showing, so that container decides how it reads on screen (a sheet, full screen, or an
   * ordinary screen).
   */
  presentationMode?: FLOW_PRESENTATION_MODE;
  /**
   * EXPERIMENTAL, iOS only (throws on Android). Presents the errors of the flow with app-owned UI, for example an
   * ordinary React Native `<Modal>`, which appears above the flow. Without it, the SDK shows its default error UI.
   *
   * The flow waits for the error to be acknowledged: return a promise that settles once the app's error UI is
   * gone, or call `request.complete()`.
   */
  errorPresenter?: (request: CheckpointErrorRequest) => void | Promise<unknown>;
  /**
   * iOS only. Called exactly once on every terminal path, after `onPassed` when it ran. Android has no native
   * signal for the end of a flow.
   */
  onFinished?: () => void;
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
 * On iOS the native SDK embeds the flow in the view controller React Native is currently showing instead of
 * presenting a modal. EXPERIMENTAL: this requires a build against a local purchases-ios with the embedded
 * checkpoint SPI.
 *
 * Returns a function that stops the call. Call it when the owning screen unmounts. On Android it removes the
 * callback and does not dismiss a flow already on screen. On iOS it also removes the embedded flow:
 * `onPassed` is suppressed and `onFinished` still fires.
 */
export function checkpoint(
  identifier: string,
  onPassed: (result: CheckpointResult) => void,
  params: CheckpointParams = {},
): () => void {
  return Platform.OS === 'ios'
    ? embeddedCheckpoint(identifier, onPassed, params)
    : modalCheckpoint(identifier, onPassed, params);
}

function modalCheckpoint(
  identifier: string,
  onPassed: (result: CheckpointResult) => void,
  params: CheckpointParams,
): () => void {
  if (params.errorPresenter) {
    throw new Error('[RevenueCatUI] A checkpoint errorPresenter requires iOS.');
  }
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
  kind?: CheckpointErrorKind;
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

function embeddedCheckpoint(
  identifier: string,
  onPassed: (result: CheckpointResult) => void,
  params: CheckpointParams,
): () => void {
  const native = nativeCheckpoints();
  if (typeof native.checkpointEmbedded !== 'function') {
    throw new Error('[RevenueCatUI] iOS checkpoints require a build against a local purchases-ios with the embedded checkpoint SPI.');
  }
  const { errorPresenter } = params;
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
        onPassed(event.result as CheckpointResult);
        break;
      case 'error': {
        const requestId = event.requestId;
        if (!errorPresenter || !requestId || !event.kind || !event.error || seenRequests.has(requestId)) {
          return;
        }
        seenRequests.add(requestId);
        let completed = false;
        const complete = () => {
          if (completed || finished) {
            return;
          }
          completed = true;
          native.completeEmbeddedError(callId, requestId);
        };
        // Whatever the presenter does, never leave the flow blocked: a throw or a rejection acknowledges too.
        try {
          const pending = errorPresenter({
            requestId,
            kind: event.kind,
            error: toPurchasesError(event.error),
            complete,
          });
          if (pending && typeof pending.then === 'function') {
            pending.then(complete, error => {
              console.warn('[RevenueCatUI] The checkpoint errorPresenter rejected:', error);
              complete();
            });
          }
        } catch (error) {
          console.warn('[RevenueCatUI] The checkpoint errorPresenter threw:', error);
          complete();
        }
        break;
      }
      case 'finished':
        finished = true;
        subscription.remove();
        params.onFinished?.();
        break;
    }
  });
  try {
    native.checkpointEmbedded(identifier, convertCustomVariablesToNativeMap(params.customVariables), callId,
      errorPresenter !== undefined);
  } catch (error) {
    subscription.remove();
    throw error;
  }
  return () => {
    if (finished || cancelled) {
      return;
    }
    cancelled = true;
    native.cancelEmbedded(callId);
  };
}
