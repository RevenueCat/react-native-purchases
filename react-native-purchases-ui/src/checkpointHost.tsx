import React, { useEffect, useState, type ReactNode } from 'react';
import { Modal, View } from 'react-native';

/** One checkpoint the host is presenting, or whose errors it is rendering. */
export interface CheckpointHostSession {
  callId: string;
  /** The container to present on iOS; null when the SDK presents the flow itself (Android). */
  presentationStyle: 'pageSheet' | 'fullScreen' | null;
  /** The error UI the app returned from `errorPresenter`, rendered inside the container. */
  error: ReactNode;
  /** Whether the container is on screen. Set to false to dismiss it; the session goes once it is gone. */
  visible: boolean;
  /** The container is on screen: the native flow can be embedded now. */
  onShow?: () => void;
  /** The container went away on its own (the user swiped the sheet down). */
  onDismiss?: () => void;
}

type Listener = (sessions: CheckpointHostSession[]) => void;

/**
 * The state behind `<CheckpointHost />`. Module level so `checkpoint()` can reach the mounted host without
 * React context, and so it can be driven in tests without rendering.
 */
export class CheckpointHostStore {
  private sessions: CheckpointHostSession[] = [];
  private listener: Listener | null = null;

  get isMounted(): boolean {
    return this.listener !== null;
  }

  get current(): readonly CheckpointHostSession[] {
    return this.sessions;
  }

  attach(listener: Listener): () => void {
    this.listener = listener;
    listener(this.sessions);
    return () => {
      if (this.listener === listener) {
        this.listener = null;
      }
    };
  }

  open(session: Omit<CheckpointHostSession, 'error' | 'visible'>): void {
    this.update([...this.sessions, { ...session, error: null, visible: true }]);
  }

  setError(callId: string, error: ReactNode): void {
    this.update(this.sessions.map(session => (session.callId === callId ? { ...session, error } : session)));
  }

  /** Dismisses the container; a session without one is removed right away. */
  close(callId: string): void {
    const session = this.sessions.find(candidate => candidate.callId === callId);
    if (!session) {
      return;
    }
    if (session.presentationStyle === null || !session.visible) {
      this.remove(callId);
      return;
    }
    this.update(this.sessions.map(candidate =>
      candidate.callId === callId ? { ...candidate, error: null, visible: false } : candidate));
  }

  remove(callId: string): void {
    this.update(this.sessions.filter(session => session.callId !== callId));
  }

  private update(sessions: CheckpointHostSession[]): void {
    this.sessions = sessions;
    this.listener?.(sessions);
  }
}

export const checkpointHost = new CheckpointHostStore();

/**
 * Renders the containers and error UI of checkpoints called with `errorPresenter`. Mount it once, near the
 * root of the app and outside any navigator, so it outlives the screens that call `checkpoint`.
 *
 * On iOS each such checkpoint gets a React Native `<Modal>` with the `presentationStyle` matching its
 * `presentationMode`; the native SDK embeds the flow in that modal, and the error UI is rendered inside it so it
 * can present above the flow. On Android the SDK presents the flow itself and only the error UI is rendered here.
 */
export function CheckpointHost(): React.JSX.Element | null {
  const [sessions, setSessions] = useState<CheckpointHostSession[]>([]);
  useEffect(() => checkpointHost.attach(setSessions), []);

  // Later sessions nest inside earlier ones: a modal can only be presented from the modal already on screen.
  return sessions.reduceRight<React.JSX.Element | null>((inner, session) => {
    if (session.presentationStyle === null) {
      return (
        <React.Fragment key={session.callId}>
          {session.error}
          {inner}
        </React.Fragment>
      );
    }
    return (
      <Modal
        key={session.callId}
        visible={session.visible}
        presentationStyle={session.presentationStyle}
        animationType="slide"
        onShow={session.onShow}
        onRequestClose={session.onDismiss}
        onDismiss={() => {
          if (session.visible) {
            session.onDismiss?.();
          }
          checkpointHost.remove(session.callId);
        }}>
        <View style={{ flex: 1 }} />
        {session.error}
        {inner}
      </Modal>
    );
  }, null);
}
