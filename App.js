import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import BatteryRing from "./components/BatteryRing";
import BatteryBuddy from "./components/BatteryBuddy";
import ThresholdInput from "./components/ThresholdInput";
import StopButton from "./components/StopButton";
import PrimaryButton from "./components/PrimaryButton";
import SettingsModal from "./components/SettingsModal";
import { COLORS } from "./constants/colors";
import { useBatteryLevel } from "./hooks/useBatteryLevel";
import { useThreshold } from "./hooks/useThreshold";
import {
  startMonitoring,
  stopAlarmSound,
  requestBatteryOptimizationExemption,
  getManufacturer,
  openAutoStartSettings
} from "./services/nativeBridge";
import { ensureNotificationPermission } from "./services/notificationService";
import { KeyboardAvoidingView, Platform } from "react-native";

export default function App() {
  const { level, monitoring, refresh } = useBatteryLevel();
   const { value, setValue, commit, saved, loaded } = useThreshold();
  const [isXiaomi, setIsXiaomi] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

   useEffect(() => {
    if (!loaded) return; // wait for the real saved threshold before starting
    (async () => {
      await ensureNotificationPermission();
      await startMonitoring(value);
      refresh();
    })();
    getManufacturer().then((m) => setIsXiaomi(m.includes("xiaomi")));
  }, [loaded]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Battery Notify</Text>
          <Pressable onPress={() => setSettingsVisible(true)} hitSlop={12}>
            <Text style={styles.gear}>⚙️</Text>
          </Pressable>
        </View>

        <BatteryRing level={level} monitoring={monitoring} />
        <BatteryBuddy level={level} charging={monitoring} />

        <View style={styles.card}>
          <ThresholdInput value={value} onChange={setValue} />
          <View style={{ height: 14 }} />
          <PrimaryButton
            label={saved ? "Saved ✓" : "Save Threshold"}
            onPress={() => commit(value)}
          />
        </View>

        <View style={styles.card}>
          <StopButton onPress={stopAlarmSound} />
        </View>
      </ScrollView>
</KeyboardAvoidingView>
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        isXiaomi={isXiaomi}
        onRequestBatteryExemption={requestBatteryOptimizationExemption}
        onOpenAutoStart={openAutoStartSettings}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    gap: 24
  },
  headerRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  title: { color: COLORS.textPrimary, fontSize: 22, fontWeight: "700" },
  gear: { fontSize: 22 },
  card: {
    width: "100%",
    backgroundColor: COLORS.bgElevated,
    borderRadius: 18,
    padding: 18
  }
});