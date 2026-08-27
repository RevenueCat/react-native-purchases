#!/usr/bin/env bash
#
# Blocks until every PurchasesHybridCommon* version pinned in this repo's
# podspecs is available on the CocoaPods CDN.
#
# A newly published pod takes a while to propagate to cdn.cocoapods.org, so
# right after a PHC release `pod install` fails with:
#
#   [!] CocoaPods could not find compatible versions for pod "PurchasesHybridCommon"
#
# The iOS CI jobs are gated on this script so a bump PR doesn't spend a mac
# executor on yarn install, simulator boot and xcodebuild only to fail at pod
# install, and doesn't need a manual rerun once the pod finally shows up.
#
# Exits 0 once every pinned version is on the CDN, 1 if it times out first.
#
# Environment overrides:
#   CDN_WAIT_TIMEOUT_SECONDS   how long to wait before giving up (default: 10800)
#   CDN_POLL_INTERVAL_SECONDS  delay between checks (default: 60)
#   CDN_WAIT_SOFT_FAIL         "true" to warn and exit 0 on timeout instead of
#                              failing, for callers that only want a re-check

set -euo pipefail

# Three hours. Propagation has been observed taking over two (18.33.1 was on
# trunk at 14:35 UTC and still not on the CDN at 16:35), and this job runs on a
# small docker executor, so waiting here is far cheaper than a mac job failing.
CDN_WAIT_TIMEOUT_SECONDS="${CDN_WAIT_TIMEOUT_SECONDS:-10800}"
CDN_POLL_INTERVAL_SECONDS="${CDN_POLL_INTERVAL_SECONDS:-60}"
CDN_WAIT_SOFT_FAIL="${CDN_WAIT_SOFT_FAIL:-false}"

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

started=$(date +%s)
deadline=$(( started + CDN_WAIT_TIMEOUT_SECONDS ))

if [ -z "$(pinned_phc_dependencies)" ]; then
  echo "❌ Found no pinned PurchasesHybridCommon dependency in the podspecs. Has their format changed?" >&2
  exit 1
fi

while read -r pod_name version; do
  [ -n "$pod_name" ] || continue

  while ! pod_version_published "$pod_name" "$version"; do
    waited=$(( $(date +%s) - started ))
    if [ "$(date +%s)" -ge "$deadline" ]; then
      if [ "$CDN_WAIT_SOFT_FAIL" = "true" ]; then
        echo "⚠️  ${pod_name} ${version} still isn't visible on this CDN edge after $(( waited / 60 ))m. Continuing anyway."
        exit 0
      fi
      echo "❌ ${pod_name} ${version} still isn't on the CocoaPods CDN after $(( waited / 60 ))m. Giving up." >&2
      exit 1
    fi
    # Logged on every poll so CircleCI sees output and doesn't hit no_output_timeout.
    echo "⏳ Waiting for ${pod_name} ${version} on the CocoaPods CDN ($(( waited / 60 ))m elapsed of $(( CDN_WAIT_TIMEOUT_SECONDS / 60 ))m)..."
    sleep "$CDN_POLL_INTERVAL_SECONDS"
  done

  echo "✅ ${pod_name} ${version} is available on the CocoaPods CDN"
done < <(pinned_phc_dependencies)
