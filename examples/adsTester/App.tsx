import React, {useCallback, useEffect, useState} from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
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
  BannerAd,
  BannerAdSize,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import {RevenueCatAdMob, TrackableAd} from 'react-native-purchases-admob';

/**
 * Configuration. Everything ships with placeholder / Google test values that
 * are safe to commit. For a real reward grant, set your RevenueCat key, an
 * AdMob unit whose server-side verification URL points at RevenueCat, and your
 * AdMob app id (`Info.plist` + `app.json`).
 */
const API_KEY = 'YOUR_REVENUECAT_API_KEY';
const AD_UNITS = {
  interstitial: TestIds.INTERSTITIAL,
  rewarded: TestIds.REWARDED,
  rewardedInterstitial: TestIds.REWARDED_INTERSTITIAL,
  appOpen: TestIds.APP_OPEN,
  banner: TestIds.BANNER,
};

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

function describeResult(result: RewardVerificationResult): string {
  if (result.failed || !result.reward) {
    return '❌ verification failed';
  }
  const extra =
    result.moreRewards.length > 0 ? ` (+${result.moreRewards.length} more)` : '';
  return `✅ ${describeReward(result.reward)}${extra}`;
}

type FullScreenAd = TrackableAd;

interface FormatProps {
  title: string;
  create: () => Promise<FullScreenAd> | FullScreenAd;
  show: (ad: FullScreenAd, onResult: (text: string) => void) => Promise<void>;
}

/** One load/show card per full-screen format. */
function FormatCard({title, create, show}: FormatProps) {
  const [ad, setAd] = useState<FullScreenAd | null>(null);
  const [status, setStatus] = useState('No ad loaded');
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    setResult(null);
    setStatus('Loading…');
    const created = await create();
    created.addAdEventsListener(({type, payload}) => {
      switch (type) {
        case AdEventType.LOADED:
        case RewardedAdEventType.LOADED:
          setAd(created);
          setBusy(false);
          setStatus(`Ad ready (${created.responseInfo?.responseId ?? '?'})`);
          break;
        case AdEventType.IMPRESSION:
          setStatus('Impression recorded');
          break;
        case AdEventType.CLOSED:
          setAd(null);
          setBusy(false);
          setStatus('Dismissed');
          break;
        case AdEventType.ERROR:
          setAd(null);
          setBusy(false);
          setStatus(`Error: ${(payload as Error).message}`);
          break;
      }
    });
    created.load();
  }, [create]);

  const onPress = useCallback(async () => {
    if (ad) {
      setBusy(true);
      await show(ad, text => {
        setStatus('Done');
        setResult(text);
      });
    } else {
      await load();
    }
  }, [ad, load, show]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.status}>{status}</Text>
      {result != null && <Text style={styles.result}>{result}</Text>}
      <TouchableOpacity
        style={[styles.button, busy && styles.buttonDisabled]}
        disabled={busy}
        onPress={onPress}>
        <Text style={styles.buttonText}>{ad ? `Show ${title}` : `Load ${title}`}</Text>
      </TouchableOpacity>
    </View>
  );
}

const showPlain = (ad: FullScreenAd) =>
  RevenueCatAdMob.showAndTrack(ad, {placement: 'shown_from_card'});

const showVerified = (
  ad: FullScreenAd,
  onResult: (text: string) => void,
) =>
  RevenueCatAdMob.showWithRewardVerification(ad, {
    placement: 'shown_from_card',
    onRewardVerificationStarted: () => onResult('Verifying reward…'),
    onRewardVerificationCompleted: result => onResult(describeResult(result)),
  });

export default function App() {
  const [configured, setConfigured] = useState(false);
  const [bannerStatus, setBannerStatus] = useState('Banner not loaded');

  useEffect(() => {
    (async () => {
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      // Mirror the native SDK log into Metro so tracked ad events are visible
      // without attaching a native log viewer.
      Purchases.setLogHandler((logLevel, message) =>
        console.log(`[Purchases ${logLevel}] ${message}`),
      );
      Purchases.configure({apiKey: API_KEY});
      await mobileAds().initialize();
      setConfigured(true);
    })();
  }, []);

  const bannerProps = RevenueCatAdMob.bannerAdProps({
    unitId: AD_UNITS.banner,
    size: BannerAdSize.BANNER,
    placement: 'banner_bottom',
    onAdLoaded: ({responseInfo}) =>
      setBannerStatus(`Banner loaded (${responseInfo?.responseId ?? '?'})`),
    onPaid: paid => setBannerStatus(`Banner paid: ${paid.value} ${paid.currency}`),
  });

  if (!configured) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.status}>Configuring…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>RevenueCat AdMob adapter ({Platform.OS})</Text>
        <FormatCard
          title="Interstitial"
          create={() =>
            RevenueCatAdMob.createInterstitialAd(AD_UNITS.interstitial, {
              placement: 'interstitial_card',
            })
          }
          show={showPlain}
        />
        <FormatCard
          title="Rewarded"
          create={() =>
            RevenueCatAdMob.createRewardedAd(AD_UNITS.rewarded, {
              placement: 'rewarded_card',
              enableRewardVerification: true,
            })
          }
          show={showVerified}
        />
        <FormatCard
          title="Rewarded Interstitial"
          create={() =>
            RevenueCatAdMob.createRewardedInterstitialAd(
              AD_UNITS.rewardedInterstitial,
              {placement: 'rewarded_interstitial_card', enableRewardVerification: true},
            )
          }
          show={showVerified}
        />
        <FormatCard
          title="App Open"
          create={() =>
            RevenueCatAdMob.createAppOpenAd(AD_UNITS.appOpen, {
              placement: 'app_open_card',
            })
          }
          show={showPlain}
        />
        <Text style={styles.status}>{bannerStatus}</Text>
      </ScrollView>
      <View style={styles.banner}>
        <BannerAd {...bannerProps} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  content: {padding: 16, gap: 12},
  header: {fontSize: 20, fontWeight: '600', textAlign: 'center', marginBottom: 8},
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  title: {fontSize: 16, fontWeight: '600'},
  status: {fontSize: 14, color: '#333', textAlign: 'center'},
  result: {fontSize: 16, fontWeight: '600', textAlign: 'center'},
  button: {
    backgroundColor: '#f2545b',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {opacity: 0.4},
  buttonText: {color: '#fff', fontSize: 15, fontWeight: '600'},
  banner: {alignItems: 'center', paddingVertical: 8},
});
