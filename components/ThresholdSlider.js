import { useRef, useState } from "react";
import { View, Text, StyleSheet, PanResponder } from "react-native";
import { COLORS } from "../constants/colors";
import { DEFAULTS } from "../constants/channels";

export default function ThresholdSlider({ value, onChange }) {
  const [trackWidth, setTrackWidth] = useState(1);
  const trackRef = useRef(null);
  const trackPageX = useRef(0); // absolute screen-X of track's left edge, from measureInWindow

  const valueFromLocalX = (x) => {
    const pct = Math.round((x / trackWidth) * DEFAULTS.MAX_THRESHOLD);
    return Math.min(DEFAULTS.MAX_THRESHOLD, Math.max(DEFAULTS.MIN_THRESHOLD, pct));
  };

  const handleLayout = () => {
    // measureInWindow gives true absolute screen coords, unaffected by
    // RTL/locale quirks that can corrupt locationX/pageX math near edges.
    trackRef.current?.measureInWindow((x, y, width) => {
      trackPageX.current = x;
      setTrackWidth(width);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        onChange(valueFromLocalX(evt.nativeEvent.pageX - trackPageX.current));
      },
      onPanResponderMove: (_, gesture) => {
        onChange(valueFromLocalX(gesture.moveX - trackPageX.current));
      }
    })
  ).current;

  const fillPct = (value / DEFAULTS.MAX_THRESHOLD) * 100;

  return (
    <View style={styles.wrap} direction="ltr">
      <View style={styles.labelRow}>
        <Text style={styles.label}>Alert threshold</Text>
        <Text style={styles.value}>{value}%</Text>
      </View>
      <View
        ref={trackRef}
        style={styles.track}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
      >
        <View style={[styles.fill, { width: `${fillPct}%` }]} />
        <View style={[styles.thumb, { left: `${fillPct}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%" },
  labelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  label: { color: COLORS.textSecondary, fontSize: 14 },
  value: { color: COLORS.textPrimary, fontSize: 14, fontWeight: "600" },
  track: {
    height: 40,
    justifyContent: "center",
    backgroundColor: COLORS.track,
    borderRadius: 20,
    overflow: "visible"
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.accent,
    borderRadius: 20
  },
  thumb: {
    position: "absolute",
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.textPrimary,
    marginLeft: -13,
    borderWidth: 3,
    borderColor: COLORS.accent
  }
});