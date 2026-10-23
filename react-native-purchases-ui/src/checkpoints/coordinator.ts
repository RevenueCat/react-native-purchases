import {
  NativeEventEmitter,
  NativeModules,
  Platform,
  UIManager,
} from "react-native";
import { convertCustomVariablesToNativeMap } from "../customVariables";
import { PURCHASES_ERROR_CODE } from "@revenuecat/purchases-typescript-internal";
import { CheckpointCancellationError } from "./types";
import type {
  CheckpointErrorRequest,
  CheckpointOptions,
  CheckpointResult,
} from "./types";

export interface HostState {
  sessionId?: string;
  visible: boolean;
  modalMounted: boolean;
  presentationMode: "fullScreen" | "pageSheet";
  error?: CheckpointErrorRequest;
}
export const emptyHostState: HostState = {
  visible: false,
  modalMounted: false,
  presentationMode: "fullScreen",
};
type Host = (state: HostState) => void;
// PHC ErrorContainer.info is a flat dictionary, unlike RN promise errors.
interface NativeErrorInfo {
  code: number;
  message: string;
  readableErrorCode?: string;
  underlyingErrorMessage?: string;
  userCancelled?: boolean | null;
  [key: string]: unknown;
}
type NativeEvent = {
  sessionId: string;
  type: string;
  presentationMode?: HostState["presentationMode"];
  flow?: CheckpointResult["flow"];
  requestId?: string;
  kind?: CheckpointErrorRequest["kind"];
  error?: NativeErrorInfo;
};
interface Session {
  id: string;
  state: HostState;
  subscription?: { remove: () => void };
  resolve: () => void;
  reject: (error: Error) => void;
  onPassed?: (result: CheckpointResult) => void;
  passed: boolean;
  shown: boolean;
  attached: boolean;
  presented: boolean;
  dismissRequested: boolean;
  finished: boolean;
  failure?: Error;
  errorIds: Set<string>;
  errors: CheckpointErrorRequest[];
}
let host: Host | undefined;
let active: Session | undefined;
let nextId = 0;
const native = () => NativeModules.RNCheckpoints;
const publish = (session: Session) => {
  if (active === session) host?.({ ...session.state });
};

export function registerHost(next: Host): () => void {
  if (host)
    throw new Error(
      "Exactly one CheckpointHost may be mounted; a host is already registered."
    );
  host = next;
  return () => {
    if (host !== next) return;
    host = undefined;
    const session = active;
    if (!session) return;
    // Retire JS ownership before native teardown, which can synchronously emit callbacks.
    active = undefined;
    session.subscription?.remove();
    try {
      native().releaseSession(session.id);
    } finally {
      session.reject(new CheckpointCancellationError());
    }
  };
}

export function checkpoint(
  identifier: string,
  options?: CheckpointOptions,
  onPassed?: (result: CheckpointResult) => void
): Promise<void> {
  if (
    Platform.OS !== "ios" ||
    !native() ||
    native().isSupported === false ||
    (Platform.Version != null && Number(Platform.Version) < 15) ||
    !UIManager.getViewManagerConfig("RCCheckpointView")
  ) {
    return Promise.reject(
      new Error(
        "Hosted checkpoints are unsupported here; an iOS 15+ native build is required."
      )
    );
  }
  if (!host)
    return Promise.reject(
      new Error(
        "Mount one RevenueCatUI.CheckpointHost before starting a checkpoint."
      )
    );
  if (active)
    return Promise.reject(new Error("A checkpoint is already active."));
  return new Promise<void>((resolve, reject) => {
    const session: Session = {
      id: `checkpoint-${Date.now()}-${++nextId}`,
      state: { ...emptyHostState },
      resolve,
      reject,
      onPassed,
      passed: false,
      shown: false,
      attached: false,
      presented: false,
      dismissRequested: false,
      finished: false,
      errorIds: new Set(),
      errors: [],
    };
    session.state.sessionId = session.id;
    active = session;
    session.subscription = new NativeEventEmitter(native()).addListener(
      "Checkpoints-event",
      (event: NativeEvent) => {
        if (active !== session || event.sessionId !== session.id) return;
        switch (event.type) {
          case "present":
            session.state = {
              ...session.state,
              visible: true,
              modalMounted: true,
              presentationMode: event.presentationMode ?? "fullScreen",
            };
            publish(session);
            break;
          case "dismiss":
            session.dismissRequested = true;
            hideFlowIfReady(session);
            break;
          case "error":
            if (
              !event.requestId ||
              !event.kind ||
              !event.error ||
              session.errorIds.has(event.requestId)
            )
              break;
            session.errorIds.add(event.requestId);
            const request: CheckpointErrorRequest = {
              sessionId: session.id,
              requestId: event.requestId,
              kind: event.kind,
              error: normalizeError(event.error),
              complete: () => completeError(session, request),
            };
            session.errors.push(request);
            session.state.error = session.errors[0];
            publish(session);
            break;
          case "passed":
            if (session.passed || session.failure) break;
            session.passed = true;
            // Consumer callbacks cannot prevent the native terminal event from cleaning up.
            try {
              session.onPassed?.({ flow: event.flow ?? null });
            } catch (error) {
              console.warn(
                "[RevenueCatUI] Checkpoint onPassed callback threw:",
                error
              );
            }
            break;
          case "finished":
            session.finished = true;
            session.dismissRequested = true;
            hideFlowIfReady(session);
            settleIfReady(session);
            break;
        }
      }
    );
    try {
      native().start(
        session.id,
        identifier,
        convertCustomVariablesToNativeMap(options?.customVariables) ?? {},
        options?.presentationMode ?? "fullScreen"
      );
    } catch (error) {
      session.failure =
        error instanceof Error ? error : new Error(String(error));
      active = undefined;
      session.subscription.remove();
      native().releaseSession(session.id);
      host?.({ ...emptyHostState });
      reject(session.failure);
    }
  });
}
function normalizeError(error: NativeErrorInfo): CheckpointErrorRequest["error"] {
  const code = String(error.code) as PURCHASES_ERROR_CODE;
  const readableErrorCode = error.readableErrorCode ?? "";
  return {
    code,
    message: error.message,
    readableErrorCode,
    underlyingErrorMessage: error.underlyingErrorMessage ?? "",
    userCancelled:
      error.userCancelled ?? code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR,
    userInfo: { ...error, readableErrorCode },
  };
}
function completeError(session: Session, request: CheckpointErrorRequest) {
  if (active !== session || session.errors[0] !== request) return;
  session.errors.shift();
  session.state.error = session.errors[0];
  publish(session);
  native().completeError(session.id, request.requestId);
  hideFlowIfReady(session);
  settleIfReady(session);
}
function hideFlowIfReady(session: Session) {
  if (active !== session || !session.dismissRequested || session.state.error)
    return;
  session.state.visible = false;
  publish(session);
}
function settleIfReady(session: Session) {
  if (
    active !== session ||
    !session.finished ||
    session.state.modalMounted ||
    session.state.error
  )
    return;
  active = undefined;
  session.subscription?.remove();
  host?.({ ...emptyHostState });
  if (session.failure) session.reject(session.failure);
  else session.resolve();
}
function owned(id: string): Session | undefined {
  return active?.id === id ? active : undefined;
}
function acknowledgePresentation(session: Session) {
  if (
    session.presented ||
    session.failure ||
    !session.shown ||
    !session.attached ||
    !session.state.visible
  )
    return;
  session.presented = true;
  native().didPresent(session.id);
}
export function didShow(id: string) {
  const session = owned(id);
  if (!session) return;
  session.shown = true;
  acknowledgePresentation(session);
}
export function didAttach(id: string) {
  const session = owned(id);
  if (!session) return;
  session.attached = true;
  acknowledgePresentation(session);
}
export function attachmentFailed(id: string) {
  const session = owned(id);
  if (!session || session.failure) return;
  session.failure = new Error(
    "Checkpoint native controller attachment failed."
  );
  native().didFailToPresent(id);
  native().cancel(id);
  session.dismissRequested = true;
  hideFlowIfReady(session);
}
export function cancel(id: string) {
  const session = owned(id);
  if (!session || session.failure) return;
  session.failure = new CheckpointCancellationError("Checkpoint cancelled.");
  native().cancel(id);
}
export function didDismiss(id: string) {
  const session = owned(id);
  if (!session || !session.state.modalMounted || session.state.visible) return;
  session.state.modalMounted = false;
  publish(session);
  native().didDismiss(id);
  settleIfReady(session);
}
