import { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
import { DEFAULTS } from "../constants/channels";

export default function ThresholdInput({ value, onChange }) {
  const [text, setText] = useState(String(value));

  useEffect(() => setText(String(value)), [value]);

  const handleChangeText = (raw) => {
    const digitsOnly = raw.replace(/[^0-9]/g, "");
    setText(digitsOnly);
  };

  const handleBlur = () => {
    let num = parseInt(text, 10);
    if (isNaN(num)) num = DEFAULTS.THRESHOLD_PERCENT;
    num = Math.min(DEFAULTS.MAX_THRESHOLD, Math.max(DEFAULTS.MIN_THRESHOLD, num));
    setText(String(num));
    onChange(num);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Alert threshold (1–99%)</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleChangeText}
          onBlur={handleBlur}
          keyboardType="number-pad"
          maxLength={2}
          placeholder="80"
          placeholderTextColor={COLORS.textSecondary}
        />
        <Text style={styles.percentSign}>%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%" },
  label: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 10 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.track,
    borderRadius: 14,
    paddingHorizontal: 18,
    height: 52
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: "700"
  },
  percentSign: { color: COLORS.textSecondary, fontSize: 20, fontWeight: "600" }
});