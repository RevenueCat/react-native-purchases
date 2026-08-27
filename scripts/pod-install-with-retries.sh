#!/usr/bin/env bash
#
# Runs `pod install --repo-update` in the given directory, but first waits for
# the PurchasesHybridCommon* versions this repo pins to be available on the
# CocoaPods CDN.
#
# A newly published pod takes a while to propagate to cdn.cocoapods.org, so on
# PHC bump PRs `pod install` fails with:
#
#   [!] CocoaPods could not find compatible versions for pod "PurchasesHybridCommon"
#
# Waiting for the CDN (and retrying the install) lets those builds pass on their
# own instead of needing a manual rerun once the pod shows up.
#
# Usage: scripts/pod-install-with-retries.sh <directory-containing-Podfile>
#
# Environment overrides:
#   POD_BIN                          command used to invoke CocoaPods (default: pod)
#   CDN_WAIT_TIMEOUT_SECONDS         how long to wait for the CDN (default: 3600)
#   CDN_POLL_INTERVAL_SECONDS        delay between CDN checks (default: 30)
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
CDN_WAIT_TIMEOUT_SECONDS="${CDN_WAIT_TIMEOUT_SECONDS:-3600}"
CDN_POLL_INTERVAL_SECONDS="${CDN_POLL_INTERVAL_SECONDS:-30}"
POD_INSTALL_ATTEMPTS="${POD_INSTALL_ATTEMPTS:-3}"
POD_INSTALL_RETRY_DELAY_SECONDS="${POD_INSTALL_RETRY_DELAY_SECONDS:-60}"

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Emits "<pod name> <version>" for every pinned PurchasesHybridCommon* dependency.
pinned_phc_dependencies() {
  sed -nE "s/.*spec\.dependency[[:space:]]+\"(PurchasesHybridCommon[A-Za-z]*)\",[[:space:]]*'([^']+)'.*/\1 \2/p" \
    "$repo_root/RNPurchases.podspec" \
    "$repo_root/react-native-purchases-ui/RNPaywalls.podspec"
}

md5_hex() {
  if command -v md5 >/dev/null 2>&1; then
    printf '%s' "$1" | md5
  else
    printf '%s' "$1" | md5sum | cut -d ' ' -f 1
  fi
}

# The CDN shards its index by the first three hex chars of the MD5 of the pod
# name, one line per pod: "<name>/<version>/<version>/...".
cdn_versions_url() {
  local hash
  hash="$(md5_hex "$1")"
  echo "https://cdn.cocoapods.org/all_pods_versions_${hash:0:1}_${hash:1:1}_${hash:2:1}.txt"
}

pod_version_published() {
  local pod_name="$1" version="$2"
  curl -fsSL -H 'Cache-Control: no-cache' "$(cdn_versions_url "$pod_name")" 2>/dev/null \
    | grep "^${pod_name}/" \
    | tr '/' '\n' \
    | grep -qxF "$version"
}

wait_for_pinned_dependencies() {
  local started deadline pod_name version waited
  started=$(date +%s)
  deadline=$(( started + CDN_WAIT_TIMEOUT_SECONDS ))

  while read -r pod_name version; do
    [ -n "$pod_name" ] || continue

    while ! pod_version_published "$pod_name" "$version"; do
      waited=$(( $(date +%s) - started ))
      if [ "$(date +%s)" -ge "$deadline" ]; then
        echo "⚠️  ${pod_name} ${version} still isn't on the CocoaPods CDN after $(( waited / 60 ))m. Running pod install anyway."
        return 0
      fi
      # Logged on every poll so CircleCI sees output and doesn't hit no_output_timeout.
      echo "⏳ Waiting for ${pod_name} ${version} on the CocoaPods CDN ($(( waited / 60 ))m elapsed of $(( CDN_WAIT_TIMEOUT_SECONDS / 60 ))m)..."
      sleep "$CDN_POLL_INTERVAL_SECONDS"
    done

    echo "✅ ${pod_name} ${version} is available on the CocoaPods CDN"
  done < <(pinned_phc_dependencies)
}

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

wait_for_pinned_dependencies

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
