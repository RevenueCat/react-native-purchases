// Created by Antonio Pallares. Copyright (c) 2026 RevenueCat, Inc.
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Purchases, {
  CustomerInfo,
  PurchasesPackage,
} from "react-native-purchases";
import config from "./build-config.json";

type Props = { app_user_id_to_log_in?: string };

export default function App(props: Props) {
  const [appUserID, setAppUserID] = useState("Loading...");
  const [entitlements, setEntitlements] = useState("Loading...");
  const [purchaseScreen, setPurchaseScreen] = useState(false);
  const [monthly, setMonthly] = useState<PurchasesPackage | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  function updateCustomerInfo(info: CustomerInfo) {
    setEntitlements(
      Object.keys(info.entitlements.active).sort().join(", ") || "None"
    );
  }

  async function perform(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (value) {
      setError(value instanceof Error ? value.message : String(value));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void perform(async () => {
      await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      Purchases.configure({ apiKey: config.apiKey });
      setAppUserID(await Purchases.getAppUserID());
    });
  }, []);

  async function showPurchaseScreen() {
    setPurchaseScreen(true);
    setEntitlements("Loading...");
    const [offerings, info] = await Promise.all([
      Purchases.getOfferings(),
      Purchases.getCustomerInfo(),
    ]);
    const selected = offerings.all.no_paywall?.monthly;
    if (
      !selected ||
      selected.identifier !== "$rc_monthly" ||
      selected.product.identifier !== "pro_monthly_subscription"
    ) {
      throw new Error(
        "no_paywall must provide the monthly pro_monthly_subscription package"
      );
    }
    setMonthly(selected);
    updateCustomerInfo(info);
  }

  const button = (
    text: string,
    testID: string,
    action: () => Promise<void>
  ) => (
    <TouchableOpacity
      testID={testID}
      disabled={busy}
      onPress={() => void perform(action)}
      style={styles.button}
    >
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {purchaseScreen ? "Purchase" : "SDK Update Tester"}
        </Text>
        {purchaseScreen ? (
          <>
            <Text style={styles.label}>Active entitlements</Text>
            <Text testID="active_entitlements" style={styles.label}>
              {entitlements}
            </Text>
            {button("Purchase", "purchase_button", async () => {
              if (!monthly) throw new Error("Monthly package not loaded");
              updateCustomerInfo(
                (await Purchases.purchasePackage(monthly)).customerInfo
              );
            })}
            {button("Back", "back_button", async () =>
              setPurchaseScreen(false)
            )}
          </>
        ) : (
          <>
            <Text testID="sdk_version" style={styles.label}>
              RevenueCat SDK {config.sdkVersion}
            </Text>
            <Text style={styles.label}>App User ID</Text>
            <Text testID="app_user_id" style={styles.label}>
              {appUserID}
            </Text>
            {props.app_user_id_to_log_in &&
              button("Log in", "log_in_button", async () => {
                const result = await Purchases.logIn(
                  props.app_user_id_to_log_in!
                );
                setAppUserID(await Purchases.getAppUserID());
                updateCustomerInfo(result.customerInfo);
              })}
            {button(
              "Purchase screen",
              "purchase_screen_button",
              showPurchaseScreen
            )}
          </>
        )}
        {error ? <Text style={styles.label}>{error}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "white" },
  content: { padding: 20, alignItems: "flex-start" },
  title: { fontSize: 24, color: "black", marginBottom: 24 },
  label: { fontSize: 17, lineHeight: 24, color: "black", marginBottom: 20 },
  button: { paddingVertical: 12, marginBottom: 20 },
  buttonText: { fontSize: 17, color: "#007aff" },
});
