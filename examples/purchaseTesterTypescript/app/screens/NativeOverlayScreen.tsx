import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Purchases from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';
// Not public yet, so it is not reachable through the package alias. Imported from source on purpose.
import { NativeOverlay } from '../../../../react-native-purchases-ui/src/nativeOverlay';

const PAYWALL_DELAY_MS = 2000;

const Panel: React.FC<{ title: string; onClose: () => void }> = ({ title, onClose }) => (
  <View style={styles.backdrop}>
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{title}</Text>
      <Text style={styles.panelBody}>
        This is ordinary React content. If you can read it above the paywall, the overlay works.
      </Text>
      <TouchableOpacity style={styles.panelButton} onPress={onClose}>
        <Text style={styles.panelButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const NativeOverlayScreen: React.FC = () => {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const append = (line: string) => setLog(current => [`${new Date().toLocaleTimeString()} ${line}`, ...current].slice(0, 8));

  const presentPaywallThen = async (show: () => void, label: string) => {
    append(`Presenting paywall, ${label} in ${PAYWALL_DELAY_MS / 1000}s`);
    try {
      // Fall back to any offering so the demo renders a paywall even without a current offering.
      const offerings = await Purchases.getOfferings();
      const offering = offerings.current ?? Object.values(offerings.all)[0];
      setTimeout(show, PAYWALL_DELAY_MS);
      const result = await RevenueCatUI.presentPaywall({ offering, displayCloseButton: true });
      append(`Paywall result: ${result}`);
    } catch (error) {
      append(`Paywall error: ${String(error)}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Native overlay</Text>
      <Text style={styles.description}>
        React Native's Modal presents from the root view controller, which is busy while a
        paywall is presented. NativeOverlay presents from the topmost view controller instead.
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => setOverlayVisible(true)}>
        <Text style={styles.buttonText}>Show overlay over this screen</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => presentPaywallThen(() => setOverlayVisible(true), 'NativeOverlay')}>
        <Text style={styles.buttonText}>Present paywall, then NativeOverlay</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => presentPaywallThen(() => setModalVisible(true), 'RN Modal')}>
        <Text style={styles.buttonText}>Present paywall, then RN Modal (for comparison)</Text>
      </TouchableOpacity>

      <View style={styles.log}>
        {log.map((line, index) => (
          <Text key={index} style={styles.logLine}>{line}</Text>
        ))}
      </View>

      <NativeOverlay
        visible={overlayVisible}
        onShow={() => append('NativeOverlay onShow')}
        onDismiss={() => {
          append('NativeOverlay onDismiss');
          setOverlayVisible(false);
        }}>
        <Panel title="NativeOverlay" onClose={() => setOverlayVisible(false)} />
      </NativeOverlay>

      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onShow={() => append('RN Modal onShow')}
        onRequestClose={() => setModalVisible(false)}>
        <Panel title="React Native Modal" onClose={() => setModalVisible(false)} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  heading: { fontSize: 20, fontWeight: '600' },
  description: { color: '#555' },
  button: { backgroundColor: '#007AFF', padding: 14, borderRadius: 8 },
  secondaryButton: { backgroundColor: '#8E8E93' },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: '600' },
  log: { marginTop: 8, gap: 4 },
  logLine: { fontFamily: 'Menlo', fontSize: 12, color: '#333' },
  backdrop: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.5)' },
  panel: { backgroundColor: 'white', borderRadius: 12, padding: 24, gap: 12 },
  panelTitle: { fontSize: 18, fontWeight: '600' },
  panelBody: { color: '#333' },
  panelButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8 },
  panelButtonText: { color: 'white', textAlign: 'center', fontWeight: '600' },
});

export default NativeOverlayScreen;
