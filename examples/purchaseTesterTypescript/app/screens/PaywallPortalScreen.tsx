import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  requireNativeComponent,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type ViewProps,
} from 'react-native';
import Purchases from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';

const PAYWALL_DELAY_MS = 2000;

// Prototype. The native view moves its React children into the topmost presented view
// controller, so a plain RN Modal rendered inside presents from the paywall instead of the
// React root. Not a public API.
type PortalProps = ViewProps & {
  onAnchored?: (event: NativeSyntheticEvent<{ controller: string }>) => void;
  onHostDismissed?: () => void;
};
const NativePaywallPortal = requireNativeComponent<PortalProps>('RCPaywallPortalView');

const PaywallPortal: React.FC<PortalProps> = ({ children, ...props }) => {
  const { width, height } = useWindowDimensions();
  return (
    <NativePaywallPortal
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, width, height }}
      {...props}>
      {children}
    </NativePaywallPortal>
  );
};

const Panel: React.FC<{ title: string; onClose: () => void }> = ({ title, onClose }) => (
  <View style={styles.backdrop}>
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{title}</Text>
      <Text style={styles.panelBody}>
        This is a plain React Native Modal. If you can read it above the paywall, the portal works.
      </Text>
      <TouchableOpacity style={styles.panelButton} onPress={onClose}>
        <Text style={styles.panelButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const PaywallPortalScreen: React.FC = () => {
  const [portalModalVisible, setPortalModalVisible] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [plainModalVisible, setPlainModalVisible] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const append = (line: string) =>
    setLog(current => [`${new Date().toLocaleTimeString()} ${line}`, ...current].slice(0, 8));

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
      <Text style={styles.heading}>Paywall portal</Text>
      <Text style={styles.description}>
        React Native's Modal presents from the view controller it finds up its responder chain.
        Inside PaywallPortal that controller is the presented paywall, so a plain Modal works.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          presentPaywallThen(() => {
            setBannerVisible(true);
            setPortalModalVisible(true);
          }, 'RN Modal inside PaywallPortal')
        }>
        <Text style={styles.buttonText}>Present paywall, then RN Modal inside PaywallPortal</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => presentPaywallThen(() => setPlainModalVisible(true), 'plain RN Modal')}>
        <Text style={styles.buttonText}>Present paywall, then RN Modal outside (for comparison)</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => setPortalModalVisible(true)}>
        <Text style={styles.buttonText}>RN Modal inside PaywallPortal, no paywall</Text>
      </TouchableOpacity>

      <View style={styles.log}>
        {log.map((line, index) => (
          <Text key={index} style={styles.logLine}>{line}</Text>
        ))}
      </View>

      <PaywallPortal
        onAnchored={event => append(`Portal anchored to ${event.nativeEvent.controller}`)}
        onHostDismissed={() => {
          append('Portal host dismissed');
          setBannerVisible(false);
          setPortalModalVisible(false);
        }}>
        {bannerVisible && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Inline React banner inside the paywall</Text>
          </View>
        )}
        <Modal
          visible={portalModalVisible}
          transparent
          animationType="fade"
          onShow={() => append('Portal Modal onShow')}
          onRequestClose={() => setPortalModalVisible(false)}>
          <Panel title="RN Modal inside PaywallPortal" onClose={() => setPortalModalVisible(false)} />
        </Modal>
      </PaywallPortal>

      <Modal
        visible={plainModalVisible}
        transparent
        animationType="fade"
        onShow={() => append('Plain Modal onShow')}
        onRequestClose={() => setPlainModalVisible(false)}>
        <Panel title="Plain RN Modal" onClose={() => setPlainModalVisible(false)} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  heading: { fontSize: 20, fontWeight: '600' },
  description: { color: '#555' },
  button: { backgroundColor: '#34C759', padding: 14, borderRadius: 8 },
  secondaryButton: { backgroundColor: '#8E8E93' },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: '600' },
  log: { marginTop: 8, gap: 4 },
  logLine: { fontFamily: 'Menlo', fontSize: 12, color: '#333' },
  banner: { position: 'absolute', top: 60, left: 16, right: 16, padding: 12, borderRadius: 8, backgroundColor: '#FFD60A' },
  bannerText: { textAlign: 'center', fontWeight: '600' },
  backdrop: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.5)' },
  panel: { backgroundColor: 'white', borderRadius: 12, padding: 24, gap: 12 },
  panelTitle: { fontSize: 18, fontWeight: '600' },
  panelBody: { color: '#333' },
  panelButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8 },
  panelButtonText: { color: 'white', textAlign: 'center', fontWeight: '600' },
});

export default PaywallPortalScreen;
