import Svg, { Circle } from "react-native-svg";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";

const SIZE = 220;
const STROKE = 16;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ringColor(level) {
  if (level === null) return COLORS.textSecondary;
  if (level >= 100) return COLORS.accent;
  if (level >= 90) return "#F5C542";
  return COLORS.accent;
}

export default function BatteryRing({ level, monitoring }) {
  const pct = level ?? 0;
  const progress = CIRCUMFERENCE * (1 - pct / 100);

  return (
    <View style={styles.wrap}>
      <Svg width={SIZE} height={SIZE}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={COLORS.track}
          strokeWidth={STROKE}
          fill="none"
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={ringColor(level)}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={progress}
          fill="none"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.percent}>{level ?? "--"}%</Text>
        <Text style={styles.status}>
          {monitoring ? "Monitoring active" : "Starting…"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" },
  center: { position: "absolute", alignItems: "center" },
  percent: { color: COLORS.textPrimary, fontSize: 44, fontWeight: "700" },
  status: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 }
});