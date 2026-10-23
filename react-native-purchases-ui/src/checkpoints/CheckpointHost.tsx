import React from "react";
import { Modal, requireNativeComponent, View } from "react-native";
import type { ViewProps } from "react-native";
import type { CheckpointErrorRequest } from "./types";
import {
  attachmentFailed,
  cancel,
  didAttach,
  didDismiss,
  didShow,
  emptyHostState,
  registerHost,
} from "./coordinator";
import type { HostState } from "./coordinator";

export interface CheckpointHostProps {
  /** Render a nested error Modal; invoke request.complete from its onDismiss. */
  renderError: (request: CheckpointErrorRequest) => React.ReactNode;
}
interface NativeProps extends ViewProps {
  sessionId: string;
  onAttached: () => void;
  onAttachmentFailed: () => void;
}
let NativeCheckpointView: React.ComponentType<NativeProps> | undefined;

/** Experimental iOS checkpoint presentation host. Mount exactly one per app. */
export class CheckpointHost extends React.Component<
  CheckpointHostProps,
  HostState
> {
  state: HostState = { ...emptyHostState };
  private unregister?: () => void;
  componentDidMount() {
    this.unregister = registerHost((state) => this.setState(state));
  }
  componentWillUnmount() {
    this.unregister?.();
  }
  render() {
    const { sessionId, modalMounted, visible, presentationMode, error } =
      this.state;
    const errorContent = error ? (
      <React.Fragment key={`${error.sessionId}:${error.requestId}`}>
        {this.props.renderError(error)}
      </React.Fragment>
    ) : null;
    if (!modalMounted || !sessionId) return errorContent;
    if (!NativeCheckpointView)
      NativeCheckpointView =
        requireNativeComponent<NativeProps>("RCCheckpointView");
    return (
      <Modal
        visible={visible}
        presentationStyle={presentationMode}
        animationType="slide"
        onShow={() => didShow(sessionId)}
        onDismiss={() => didDismiss(sessionId)}
        onRequestClose={() => cancel(sessionId)}
      >
        <View style={{ flex: 1 }}>
          <NativeCheckpointView
            style={{ flex: 1 }}
            sessionId={sessionId}
            onAttached={() => didAttach(sessionId)}
            onAttachmentFailed={() => attachmentFailed(sessionId)}
          />
          {errorContent}
        </View>
      </Modal>
    );
  }
}
