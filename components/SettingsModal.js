import { useEffect, useState } from "react";
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import PrimaryButton from "./PrimaryButton";
import { COLORS } from "../constants/colors";
import { pickRingtone, getRingtoneTitle, setChannelSound } from "../services/nativeBridge";
import { getSavedSoundUri, saveSoundUriLocally } from "../storage/soundStorage";

function SoundPicker({ channelType, label }) {
  const [title, setTitle] = useState("Loading…");

  const refreshTitle = async (uri) => {
    const t = await getRingtoneTitle(uri);
    setTitle(t);
  };

  useEffect(() => {
    getSavedSoundUri(channelType).then(refreshTitle);
  }, []);

  const handlePick = async () => {
    const uri = await pickRingtone(channelType);
    await saveSoundUriLocally(channelType, uri);
    await setChannelSound(channelType, uri);
    refreshTitle(uri);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{label}</Text>
      <Text style={styles.cardText}>Current: {title}</Text>
      <View style={{ height: 10 }} />
      <PrimaryButton variant="outline" label="Choose Sound" onPress={handlePick} />
    </View>
  );
}

export default function SettingsModal({
  visible,
  onClose,
  isXiaomi,
  onRequestBatteryExemption,
  onOpenAutoStart
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Settings</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 20 }}>
            <SoundPicker channelType="full" label="Full Charge (100%) Sound" />
            <SoundPicker channelType="threshold" label="Threshold Alert Sound" />

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Background reliability</Text>
              <Text style={styles.cardText}>
                Android may still kill background monitoring over time.
                Grant this exemption once for reliable always-on alerts.
              </Text>
              <View style={{ height: 10 }} />
              <PrimaryButton
                variant="outline"
                label="Ignore Battery Optimizations"
                onPress={onRequestBatteryExemption}
              />
            </View>

            {isXiaomi && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Xiaomi/MIUI setup</Text>
                <Text style={styles.cardText}>
                  MIUI blocks background apps by default. Enable Autostart so
                  notifications keep working after a restart.
                </Text>
                <View style={{ height: 10 }} />
                <PrimaryButton
                  variant="outline"
                  label="Open Autostart Settings"
                  onPress={onOpenAutoStart}
                />
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "80%"
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18
  },
  title: { color: COLORS.textPrimary, fontSize: 20, fontWeight: "700" },
  close: { color: COLORS.textSecondary, fontSize: 22 },
  card: { backgroundColor: COLORS.bgElevated, borderRadius: 18, padding: 18 },
  cardTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: "700", marginBottom: 6 },
  cardText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 }
});