import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS, DEFAULTS } from "../constants/channels";

export async function getThreshold() {
  const saved = await AsyncStorage.getItem(STORAGE_KEYS.THRESHOLD);
  return saved !== null ? parseInt(saved, 10) : DEFAULTS.THRESHOLD_PERCENT;
}

export async function saveThreshold(value) {
  const clamped = Math.min(
    DEFAULTS.MAX_THRESHOLD,
    Math.max(DEFAULTS.MIN_THRESHOLD, value)
  );
  await AsyncStorage.setItem(STORAGE_KEYS.THRESHOLD, String(clamped));
  // A saved threshold change resets the "already fired today" guard so the
  // new value can trigger again even if the old one already fired once.
  await AsyncStorage.removeItem(STORAGE_KEYS.THRESHOLD_FIRED);
  return clamped;
}

// --- Dedupe guards: prevent the same charge-level from re-firing the
// notification repeatedly while it hovers at/above the mark (this is the
// #1 cause of "repeated notification" bugs). Guards reset once the phone
// unplugs and battery drops back below the mark. ---

export async function hasFired(key) {
  return (await AsyncStorage.getItem(key)) === "true";
}

export async function setFired(key, value) {
  if (value) {
    await AsyncStorage.setItem(key, "true");
  } else {
    await AsyncStorage.removeItem(key);
  }
}
