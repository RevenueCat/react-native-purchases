import 'react-native-get-random-values';
import React, {useCallback, useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Purchases, {
  RewardVerificationResult,
  VerifiedReward,
} from 'react-native-purchases';
import mobileAds, {
  AdEventType,
  RewardedAdEventType,
  RewardedInterstitialAd,
  TestIds,
} from 'react-native-google-mobile-ads';
import {v4 as uuidv4} from 'uuid';

// Your RevenueCat public SDK key (a Test Store key works while developing).
const API_KEY = 'YOUR_REVENUECAT_API_KEY';

// Google's official test rewarded-interstitial ad unit (per-platform) — safe
// to commit and always fills. Swap for your own AdMob unit (with its
// server-side verification URL pointed at RevenueCat) to grant a real reward.
const AD_UNIT_ID = TestIds.REWARDED_INTERSTITIAL;

function describeReward(reward: VerifiedReward): string {
  switch (reward.type) {
    case 'virtual_currency':
      return `+${reward.amount} ${reward.code}`;
    case 'entitlement':
      return `entitlement "${reward.identifier}"`;
    case 'no_reward':
      return 'no reward';
    case 'unsupported_reward':
      return 'unsupported reward';
  }
}

export default function App() {
  const [status, setStatus] = useState('Configuring…');
  const [impressionId, setImpressionId] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      Purchases.configure({apiKey: API_KEY});
      await mobileAds().initialize();
      setStatus('Ready. Tap to load a rewarded ad.');
      setReady(true);
    })();
  }, []);

  const loadAndShow = useCallback(async () => {
    setReady(false);
    setResult(null);
    setStatus('Generating verification token…');

    // react-native-google-mobile-ads doesn't expose AdMob's response id before
    // the ad loads (SSV options must be set at request time), so assign your own
    // unique impression ID. Reuse it for your RevenueCat ad-tracking calls to
    // correlate the reward with the impression.
    const id = uuidv4();
    setImpressionId(id);

    let token;
    try {
      token = await Purchases.generateRewardVerificationToken(id);
    } catch (e) {
      setStatus(`❌ Failed to generate verification token: ${e}`);
      setReady(true);
      return;
    }

    // Forward the token to AdMob's server-side verification options.
    const ad = RewardedInterstitialAd.createForAdRequest(AD_UNIT_ID, {
      serverSideVerificationOptions: {
        userId: token.appUserID,
        customData: token.customData,
      },
    });

    const unsubLoaded = ad.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        setStatus('Ad loaded. Showing…');
        ad.show();
      },
    );

    let finished = false;

    const cleanup = () => {
      unsubLoaded();
      unsubEarned();
      unsubError();
      unsubClosed();
    };

    // When the user earns the reward, poll RevenueCat for the verified result.
    const unsubEarned = ad.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      async () => {
        setStatus('Reward earned. Verifying…');
        try {
          const res: RewardVerificationResult =
            await Purchases.pollRewardVerification(token.clientTransactionId);
          if (res.failed || !res.reward) {
            setResult('❌ verification failed');
          } else {
            const extra =
              res.moreRewards.length > 0
                ? ` (+${res.moreRewards.length} more)`
                : '';
            setResult(`✅ ${describeReward(res.reward)}${extra}`);
          }
          setStatus('Done');
        } finally {
          finished = true;
          setReady(true);
        }
      },
    );

    const unsubError = ad.addAdEventListener(AdEventType.ERROR, error => {
      setStatus(`❌ Ad error: ${error.message}`);
      finished = true;
      setReady(true);
      cleanup();
    });

    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      if (!finished) {
        finished = true;
        setReady(true);
      }
      cleanup();
    });

    setStatus('Loading ad…');
    ad.load();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Rewarded Ad Verification</Text>
        <Text style={styles.status}>{status}</Text>
        {impressionId != null && (
          <Text style={styles.impression}>impressionId: {impressionId}</Text>
        )}
        {result != null && <Text style={styles.result}>{result}</Text>}
        <TouchableOpacity
          style={[styles.button, !ready && styles.buttonDisabled]}
          disabled={!ready}
          onPress={loadAndShow}>
          <Text style={styles.buttonText}>Load & show rewarded ad</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  content: {flex: 1, justifyContent: 'center', padding: 24, gap: 16},
  title: {fontSize: 22, fontWeight: '600', textAlign: 'center'},
  status: {fontSize: 16, textAlign: 'center', color: '#333'},
  impression: {fontSize: 13, textAlign: 'center', color: '#888'},
  result: {fontSize: 18, textAlign: 'center', fontWeight: '600'},
  button: {
    backgroundColor: '#f2545b',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {opacity: 0.4},
  buttonText: {color: '#fff', fontSize: 16, fontWeight: '600'},
});
