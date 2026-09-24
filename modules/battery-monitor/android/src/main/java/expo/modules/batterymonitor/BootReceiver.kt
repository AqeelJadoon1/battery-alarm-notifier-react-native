package expo.modules.batterymonitor

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Build

// Without this, the service only starts again once the user manually
// reopens the app after a reboot — defeats the "works even when app is
// closed" requirement.
class BootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != Intent.ACTION_BOOT_COMPLETED) return

    val prefs: SharedPreferences =
      context.getSharedPreferences("battery_monitor_prefs", Context.MODE_PRIVATE)
    val wasRunning = prefs.getBoolean("was_running", false)
    val savedThreshold = prefs.getInt("threshold", 80)
    if (!wasRunning) return

    val serviceIntent = Intent(context, BatteryForegroundService::class.java).apply {
      putExtra(BatteryForegroundService.EXTRA_THRESHOLD, savedThreshold)
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      context.startForegroundService(serviceIntent)
    } else {
      context.startService(serviceIntent)
    }
  }
}
