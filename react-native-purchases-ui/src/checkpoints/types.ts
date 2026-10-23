import type {
  PurchasesEntitlementInfo,
  PurchasesError,
} from "@revenuecat/purchases-typescript-internal";
import type { CustomVariables } from "../customVariables";

/** Experimental iOS hosted checkpoint options. Requires iOS 15 or later. */
export interface CheckpointOptions {
  customVariables?: CustomVariables;
  presentationMode?: "fullScreen" | "pageSheet";
}

/** Native checkpoint result. A null flow means no offering or workflow matched. */
export interface CheckpointResult {
  flow: { obtainedEntitlements: PurchasesEntitlementInfo[] } | null;
}

/** Call complete only after the consumer's error UI has dismissed (Modal.onDismiss). */
export interface CheckpointErrorRequest {
  sessionId: string;
  requestId: string;
  error: PurchasesError;
  kind: "flowCouldNotBeShown" | "flowActionFailed" | "flowResultSyncFailed";
  complete: () => void;
}

export class CheckpointCancellationError extends Error {
  readonly code = "CHECKPOINT_CANCELLED";
  constructor(
    message = "Checkpoint cancelled because its host was unmounted."
  ) {
    super(message);
    this.name = "CheckpointCancellationError";
  }
}
