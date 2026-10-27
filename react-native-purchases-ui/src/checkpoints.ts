import type { ReactNode } from 'react';
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
import { checkpointHost } from './checkpointHost';

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
 * An error the native checkpoint wants shown by the app. The flow stays on screen, blocked, until `complete`
 * is called, so call it once the app's error UI has fully dismissed (for a `<Modal>`, from `onDismiss`).
 */
export interface CheckpointErrorRequest {
  requestId: string;
  kind: CheckpointErrorKind;
  error: PurchasesError;
  /** Acknowledges the error natively and removes the error UI. Idempotent. */
  complete: () => void;
}

export interface CheckpointParams {
  customVariables?: CustomVariables;
  /** How the SDK presents the flow. */
  presentationMode?: FLOW_PRESENTATION_MODE;
  /**
   * EXPERIMENTAL. Presents the errors of the flow with app-owned UI instead of the SDK's own dialog. Returns the
   * element to render, typically a transparent `<Modal>`, which must call `request.complete()` once it is gone.
   * Requires `<CheckpointHost />` to be mounted once near the root of the app; the host renders the element.
   *
   * On iOS the SDK does not present the flow modally then, because an RN `<Modal>` cannot present over a
   * native modal: the host opens a `<Modal>` matching `presentationMode`, the native SDK embeds the flow in it,
   * and the error UI renders inside. On Android the SDK presents the flow as usual and the error UI is rendered
   * by the host as a dialog above it. The iOS path requires a build against a local purchases-ios with the
   * embedded checkpoint SPI.
   */
  errorPresenter?: (request: CheckpointErrorRequest) => ReactNode;
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
 * Returns a function that detaches the callback. Call it when the owning screen unmounts. It does not dismiss
 * a flow the SDK presented; with `errorPresenter` on iOS it also removes the embedded flow and its container.
 */
export function checkpoint(
  identifier: string,
  onPassed: (result: CheckpointResult) => void,
  params: CheckpointParams = {},
): () => void {
  return params.errorPresenter
    ? presentedCheckpoint(identifier, onPassed, params, params.errorPresenter)
    : modalCheckpoint(identifier, onPassed, params);
}

function modalCheckpoint(
  identifier: string,
  onPassed: (result: CheckpointResult) => void,
  params: CheckpointParams,
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

// MARK: - Experimental: checkpoints with app-owned error UI

const EMBEDDED_EVENT = 'Checkpoints-embedded';
const ERROR_EVENT = 'Checkpoints-onError';

// PHC ErrorContainer.info is a flat dictionary, unlike RN promise errors.
interface NativeErrorInfo {
  code: number | string;
  message: string;
  readableErrorCode?: string;
  underlyingErrorMessage?: string;
  userCancelled?: boolean | null;
  [key: string]: unknown;
}

interface NativeCheckpointEvent {
  callId: string;
  type?: 'error' | 'passed' | 'finished';
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

function presentationStyle(mode: FLOW_PRESENTATION_MODE | undefined): 'pageSheet' | 'fullScreen' {
  return mode === FLOW_PRESENTATION_MODE.MODAL_FULL_SCREEN ? 'fullScreen' : 'pageSheet';
}

function presentedCheckpoint(
  identifier: string,
  onPassed: (result: CheckpointResult) => void,
  params: CheckpointParams,
  errorPresenter: (request: CheckpointErrorRequest) => ReactNode,
): () => void {
  if (!checkpointHost.isMounted) {
    throw new Error('[RevenueCatUI] Mount <CheckpointHost /> once near the root of your app to use errorPresenter.');
  }
  const native = nativeCheckpoints();
  const ios = Platform.OS === 'ios';
  if (ios && typeof native.checkpointEmbedded !== 'function') {
    throw new Error('[RevenueCatUI] errorPresenter on iOS requires a build against a local purchases-ios with the embedded checkpoint SPI.');
  }
  const callId = `${callIdPrefix}-${++nextCallId}`;
  const variables = convertCustomVariablesToNativeMap(params.customVariables);
  const seenRequests = new Set<string>();
  const emitter = new NativeEventEmitter(native);
  let finished = false;
  let cancelled = false;

  const finish = () => {
    if (finished) {
      return;
    }
    finished = true;
    subscriptions.forEach(subscription => subscription.remove());
    checkpointHost.close(callId);
  };

  const presentError = (requestId: string, kind: CheckpointErrorKind, error: NativeErrorInfo) => {
    if (seenRequests.has(requestId)) {
      return;
    }
    seenRequests.add(requestId);
    let completed = false;
    const complete = () => {
      if (completed) {
        return;
      }
      completed = true;
      checkpointHost.setError(callId, null);
      if (!finished) {
        (ios ? native.completeEmbeddedError : native.completeError)(callId, requestId);
      }
    };
    const request: CheckpointErrorRequest = { requestId, kind, error: toPurchasesError(error), complete };
    try {
      checkpointHost.setError(callId, errorPresenter(request));
    } catch (thrown) {
      // Never leave the flow blocked behind error UI that failed to render.
      console.warn('[RevenueCatUI] The checkpoint errorPresenter threw:', thrown);
      complete();
    }
  };

  const handle = (event: NativeCheckpointEvent) => {
    if (event.callId !== callId || finished) {
      return;
    }
    switch (event.type) {
      case 'passed':
        if (!seenRequests.has('passed')) {
          seenRequests.add('passed');
          onPassed(event.result as CheckpointResult);
        }
        if (!ios) {
          finish();
        }
        break;
      case 'error':
        if (event.requestId && event.kind && event.error) {
          presentError(event.requestId, event.kind, event.error);
        }
        break;
      case 'finished':
        finish();
        break;
    }
  };

  const subscriptions = ios
    ? [emitter.addListener(EMBEDDED_EVENT, handle)]
    : [
      emitter.addListener(PASSED_EVENT, (event: NativeCheckpointEvent) => handle({ ...event, type: 'passed' })),
      emitter.addListener(ERROR_EVENT, (event: NativeCheckpointEvent) => handle({ ...event, type: 'error' })),
    ];

  try {
    if (ios) {
      // The flow is embedded once the container is on screen, so the controller React Native shows is the
      // modal's. The SDK notices the container going away on its own and cancels; the dismiss handler only
      // covers a swipe before anything was embedded.
      checkpointHost.open({
        callId,
        presentationStyle: presentationStyle(params.presentationMode),
        onShow: () => native.checkpointEmbedded(identifier, variables, callId),
        onDismiss: () => { if (!finished) { native.cancelEmbedded(callId); } },
      });
    } else {
      native.checkpointWithErrorPresenter(identifier, variables,
        params.presentationMode ?? FLOW_PRESENTATION_MODE.DEFAULT, callId);
      checkpointHost.open({ callId, presentationStyle: null });
    }
  } catch (error) {
    finish();
    throw error;
  }

  return () => {
    if (finished || cancelled) {
      return;
    }
    cancelled = true;
    if (ios) {
      // The native finished event closes the container.
      native.cancelEmbedded(callId);
    } else {
      finish();
    }
  };
}
