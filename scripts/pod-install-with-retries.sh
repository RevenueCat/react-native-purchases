#!/usr/bin/env bash
#
# Runs `pod install --repo-update` in the given directory, retrying when it fails
# because the pinned PurchasesHybridCommon* version isn't on the CocoaPods CDN yet.
#
# The iOS CI jobs are already gated on scripts/wait-for-pods-on-cdn.sh, so by the
# time this runs the pod should be published. The short re-check and the retries
# here cover the gap between the two: the gate job and the mac job can hit
# different CDN edge nodes, so the pod can be visible to one and not yet the other.
#
# Usage: scripts/pod-install-with-retries.sh <directory-containing-Podfile>
#
# Environment overrides:
#   POD_BIN                          command used to invoke CocoaPods (default: pod)
#   CDN_WAIT_TIMEOUT_SECONDS         how long to re-check the CDN first (default: 300)
#   POD_INSTALL_ATTEMPTS             how many times to run pod install when it
#                                    fails with a CDN-propagation error (default: 3)
#   POD_INSTALL_RETRY_DELAY_SECONDS  delay between pod install attempts (default: 60)

set -euo pipefail

pod_dir="${1:-}"
if [ -z "$pod_dir" ]; then
  echo "Usage: $0 <directory-containing-Podfile>" >&2
  exit 1
fi

POD_BIN="${POD_BIN:-pod}"
POD_INSTALL_ATTEMPTS="${POD_INSTALL_ATTEMPTS:-3}"
POD_INSTALL_RETRY_DELAY_SECONDS="${POD_INSTALL_RETRY_DELAY_SECONDS:-60}"

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# The only failures worth retrying: both mean the pinned version isn't visible to
# the resolver yet. Every other pod install failure (bad Podfile, missing target,
# Ruby/gem problems) fails identically on every attempt, so retrying it only
# buries the real error further up the log.
RETRIABLE_ERRORS=(
  'CocoaPods could not find compatible versions for pod'
  'Unable to find a specification for'
)

is_retriable_failure() {
  local log_file="$1" pattern
  for pattern in "${RETRIABLE_ERRORS[@]}"; do
    if grep -qF "$pattern" "$log_file"; then
      echo "$pattern"
      return 0
    fi
  done
  return 1
}

# Short and soft by design: the gate job already did the long wait, so this only
# covers an edge node that is still catching up. If it doesn't resolve, fall
# through and let pod install produce the real error.
CDN_WAIT_TIMEOUT_SECONDS="${CDN_WAIT_TIMEOUT_SECONDS:-300}" \
CDN_WAIT_SOFT_FAIL=true \
  "$repo_root/scripts/wait-for-pods-on-cdn.sh"

cd "$pod_dir"

pod_install_log="$(mktemp)"
trap 'rm -f "$pod_install_log"' EXIT

attempt=1
while true; do
  echo "▶️  pod install --repo-update in $(pwd) (attempt ${attempt}/${POD_INSTALL_ATTEMPTS})"
  # shellcheck disable=SC2086 # POD_BIN may be a multi-word command, e.g. "bundle exec pod"
  if $POD_BIN install --repo-update 2>&1 | tee "$pod_install_log"; then
    exit 0
  fi

  matched_error="$(is_retriable_failure "$pod_install_log")" || {
    echo "❌ pod install failed, and not because the pod is missing from the CDN. Not retrying." >&2
    exit 1
  }

  if [ "$attempt" -ge "$POD_INSTALL_ATTEMPTS" ]; then
    echo "❌ pod install still failing with \"${matched_error}\" after ${POD_INSTALL_ATTEMPTS} attempts" >&2
    exit 1
  fi

  echo "⚠️  pod install failed with \"${matched_error}\", retrying in ${POD_INSTALL_RETRY_DELAY_SECONDS}s..."
  sleep "$POD_INSTALL_RETRY_DELAY_SECONDS"
  attempt=$(( attempt + 1 ))
done
