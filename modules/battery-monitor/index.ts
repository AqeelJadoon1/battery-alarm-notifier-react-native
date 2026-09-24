import { requireNativeModule } from "expo-modules-core";

// Thin typed wrapper around the native Kotlin module. Every RN screen/hook
// should talk to the service through THIS file only — never call
// requireNativeModule directly elsewhere, so the native API surface stays
// in one place.
const NativeBatteryMonitor = requireNativeModule("BatteryMonitor");

export interface BatteryMonitorAPI {
  /** Starts the persistent foreground service. Safe to call if already running. */
  startService(threshold: number): Promise<boolean>;
  /** Stops the foreground service entirely (user opted out of monitoring). */
  stopService(): Promise<boolean>;
  /** Updates the saved threshold the running service checks against. */
  updateThreshold(threshold: number): Promise<boolean>;
  /** Stops any currently playing/looping alarm sound. */
  stopAlarmSound(): Promise<boolean>;
  /** Returns whether the service is currently running. */
  isServiceRunning(): Promise<boolean>;
  /** Requests "ignore battery optimizations" exemption (needed on MIUI/Poco devices). */
  requestBatteryOptimizationExemption(): Promise<void>;
  /** Returns the current battery percentage read natively (no JS-side delay). */
  getCurrentBatteryLevel(): Promise<number>;
  
  getManufacturer(): Promise<string>;
  openAutoStartSettings(): Promise<boolean>;

    getManufacturer(): Promise<string>;
  openAutoStartSettings(): Promise<boolean>;
  pickRingtone(channelType: "full" | "threshold"): Promise<string | null>;
  getRingtoneTitle(uri: string | null): Promise<string>;
  setChannelSound(channelType: "full" | "threshold", uri: string | null): Promise<boolean>;
}

export default NativeBatteryMonitor as BatteryMonitorAPI;
