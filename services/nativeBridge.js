import BatteryMonitor from "../modules/battery-monitor";

// Every screen/hook imports from HERE, not from modules/battery-monitor
// directly — keeps one place to change if the native API shape changes.

export async function startMonitoring(threshold) {
  return BatteryMonitor.startService(threshold);
}

export async function stopMonitoring() {
  return BatteryMonitor.stopService();
}

export async function pushThresholdToService(threshold) {
  return BatteryMonitor.updateThreshold(threshold);
}

export async function stopAlarmSound() {
  return BatteryMonitor.stopAlarmSound();
}

export async function isMonitoring() {
  return BatteryMonitor.isServiceRunning();
}

export async function getBatteryLevel() {
  return BatteryMonitor.getCurrentBatteryLevel();
}

export async function requestBatteryOptimizationExemption() {
  return BatteryMonitor.requestBatteryOptimizationExemption();
}

export async function getManufacturer() {
  return BatteryMonitor.getManufacturer();
}

export async function openAutoStartSettings() {
  return BatteryMonitor.openAutoStartSettings();
}

export async function pickRingtone(channelType) {
  return BatteryMonitor.pickRingtone(channelType);
}

export async function getRingtoneTitle(uri) {
  return BatteryMonitor.getRingtoneTitle(uri);
}

export async function setChannelSound(channelType, uri) {
  return BatteryMonitor.setChannelSound(channelType, uri);
}

