import { Pressable, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";

export default function PrimaryButton({ onPress, label, variant = "solid" }) {
  const isOutline = variant === "outline";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        isOutline && styles.outline,
        pressed && styles.pressed
      ]}
    >
      <Text style={[styles.text, isOutline && styles.outlineText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    width: "100%"
  },
  outline: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: COLORS.divider },
  pressed: { opacity: 0.8 },
  text: { color: "#0B0E11", fontSize: 16, fontWeight: "700" },
  outlineText: { color: COLORS.textPrimary }
});