import * as Notifications from "expo-notifications";

// Only handles the one-time permission prompt. Actual alert notifications
// are fired natively from BatteryForegroundService (see native bridge),
// not from here — this file exists so permission logic has one home.
export async function ensureNotificationPermission() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}
