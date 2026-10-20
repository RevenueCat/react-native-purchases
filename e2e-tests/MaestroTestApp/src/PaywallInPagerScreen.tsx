import React, {useRef, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
// Keep PagerView pinned to 6.9.1 so this test supports both architectures.
// Version 7+ requires the new architecture; 6.9.1 still uses ViewPager2 on Android.
import PagerView from 'react-native-pager-view';
import RevenueCatUI from 'react-native-purchases-ui';

const PAGE_COUNT = 3;

// Regression test for https://github.com/RevenueCat/react-native-purchases/issues/1836 (Android).
// PagerView uses ViewPager2 on Android. Moving one page away puts the paywall's page in the RecyclerView's view cache:
// detached, but its composition is kept. Changing a paywall prop then recomposes it while detached, which crashed
// with "No ViewModelStoreOwner was provided via LocalViewModelStoreOwner".
export default function PaywallInPagerScreen() {
  const pagerRef = useRef<PagerView>(null);
  const [page, setPage] = useState(0);
  const [displayCloseButton, setDisplayCloseButton] = useState(true);

  return (
    <View style={styles.container}>
      <Text testID="pager-status" style={styles.label}>
        Page {page + 1}/{PAGE_COUNT} · displayCloseButton: {String(displayCloseButton)}
      </Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => pagerRef.current?.setPage(page + 1)}
          testID="next-page-button">
          <Text style={styles.buttonText}>Next page</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setDisplayCloseButton(value => !value)}
          testID="toggle-close-button">
          <Text style={styles.buttonText}>Toggle close button</Text>
        </TouchableOpacity>
      </View>
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={event => setPage(event.nativeEvent.position)}>
        <View key="paywall" style={styles.page} collapsable={false}>
          <RevenueCatUI.Paywall options={{displayCloseButton}} />
        </View>
        {Array.from({length: PAGE_COUNT - 1}, (_, index) => (
          <View key={`filler-${index}`} style={[styles.page, styles.filler]} collapsable={false}>
            <Text>Filler page {index + 2}</Text>
          </View>
        ))}
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  label: {fontSize: 16, padding: 12},
  buttons: {flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingBottom: 8},
  button: {padding: 12, backgroundColor: '#007AFF', borderRadius: 8},
  buttonText: {color: 'white', fontSize: 14},
  pager: {flex: 1},
  page: {width: '100%', height: '100%'},
  filler: {alignItems: 'center', justifyContent: 'center'},
});
