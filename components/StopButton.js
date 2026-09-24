import { Pressable, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";

export default function StopButton({ onPress, label = "Stop Alarm" }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: COLORS.accentAlert,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    width: "100%"
  },
  pressed: { opacity: 0.8 },
  text: { color: "#fff", fontSize: 16, fontWeight: "700" }
});