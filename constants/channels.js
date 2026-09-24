// Single source of truth for notification channel IDs and default values.
// IMPORTANT: once a channel is created on-device with a sound, Android locks
// that sound permanently. If you ever change the sound file, bump the ID
// (e.g. "full_charge_alert_v2") so Android creates a fresh channel.

export const CHANNELS = {
  FULL_CHARGE: {
    id: "full_charge_alert_v1",
    name: "Full Charge Alert",
    description: "Notifies when battery reaches 100%",
    androidSound: "default_full", // maps to a system sound in alarmSoundService
    importance: "max"
  },
  THRESHOLD: {
    id: "threshold_alert_v1",
    name: "Threshold Alert",
    description: "Notifies when battery reaches your custom threshold",
    androidSound: "default_threshold",
    importance: "high"
  }
};

export const NOTIFICATION_IDS = {
  FULL_CHARGE: 1001,
  THRESHOLD: 1002,
  FOREGROUND_SERVICE: 1
};

export const DEFAULTS = {
  THRESHOLD_PERCENT: 80,
  MIN_THRESHOLD: 1,
  MAX_THRESHOLD: 99,
  AUTO_STOP_MS: 2 * 60 * 1000 // 2 minutes
};

export const STORAGE_KEYS = {
  THRESHOLD: "@battery_notify/threshold",
  FULL_CHARGE_FIRED: "@battery_notify/full_charge_fired", // dedupe guard
  THRESHOLD_FIRED: "@battery_notify/threshold_fired" // dedupe guard
};
