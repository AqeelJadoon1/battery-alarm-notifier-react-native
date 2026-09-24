import { useEffect, useRef } from "react";
import { View, Text, Animated, Easing, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";

export default function BatteryBuddy({ level, charging }) {
  const breathe = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;
  const tilt = useRef(new Animated.Value(0)).current;
  const zFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
      ])
    ).start();
  }, []);

  useEffect(() => {
    const blinkLoop = () => {
      Animated.sequence([
        Animated.timing(blink, { toValue: 0.05, duration: 90, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: 90, useNativeDriver: true })
      ]).start(() => {
        setTimeout(blinkLoop, 2200 + Math.random() * 2000);
      });
    };
    blinkLoop();
  }, []);

  useEffect(() => {
    Animated.timing(tilt, {
      toValue: charging ? 1 : 0,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true
    }).start();
  }, [charging]);

  useEffect(() => {
    if (!charging) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(zFloat, { toValue: 1, duration: 1600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(zFloat, { toValue: 0, duration: 0, useNativeDriver: true })
      ])
    ).start();
  }, [charging]);

  const scale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });
  const rotate = tilt.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "78deg"] });
  const zTranslate = zFloat.interpolate({ inputRange: [0, 1], outputRange: [0, -30] });
  const zOpacity = zFloat.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] });

  const happy = (level ?? 0) >= 95;

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.body, { transform: [{ rotate }, { scale }] }]}>
        <View style={styles.face}>
          <Animated.View style={[styles.eye, { transform: [{ scaleY: blink }] }]} />
          <Animated.View style={[styles.eye, { transform: [{ scaleY: blink }] }]} />
        </View>
        <View style={[styles.mouth, happy && styles.mouthHappy]} />
      </Animated.View>

      {charging && (
        <Animated.Text
          style={[
            styles.zzz,
            { opacity: zOpacity, transform: [{ translateY: zTranslate }] }
          ]}
        >
          z z z
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 70, alignItems: "center", justifyContent: "center" },
  body: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center"
  },
  face: { flexDirection: "row", gap: 10, marginBottom: 6 },
  eye: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.bg },
  mouth: { width: 14, height: 3, borderRadius: 2, backgroundColor: COLORS.bg },
  mouthHappy: { width: 18, height: 8, borderRadius: 8, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  zzz: { position: "absolute", top: -10, right: "30%", color: COLORS.textSecondary, fontWeight: "700" }
});