package expo.modules.batterymonitor

import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise

class BatteryMonitorModule : Module() {

  companion object {
    private const val REQUEST_PICK_RINGTONE = 9001
  }

  private var pendingPromise: Promise? = null
  private var pendingChannelType: String? = null

  private val context: Context
    get() = appContext.reactContext ?: throw IllegalStateException("No context")

  override fun definition() = ModuleDefinition {
    Name("BatteryMonitor")

    AsyncFunction("startService") { threshold: Int ->
      val intent = Intent(context, BatteryForegroundService::class.java).apply {
        putExtra(BatteryForegroundService.EXTRA_THRESHOLD, threshold)
      }
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
      true
    }

    AsyncFunction("stopService") {
      context.stopService(Intent(context, BatteryForegroundService::class.java))
      true
    }

    AsyncFunction("updateThreshold") { threshold: Int ->
      val intent = Intent(BatteryForegroundService.ACTION_UPDATE_THRESHOLD).apply {
        setPackage(context.packageName)
        putExtra(BatteryForegroundService.EXTRA_THRESHOLD, threshold)
      }
      context.sendBroadcast(intent)
      true
    }

    AsyncFunction("stopAlarmSound") {
      val intent = Intent(BatteryForegroundService.ACTION_STOP_ALARM).apply {
        setPackage(context.packageName)
      }
      context.sendBroadcast(intent)
      true
    }

    AsyncFunction("isServiceRunning") {
      BatteryForegroundService.isRunning
    }

    AsyncFunction("getCurrentBatteryLevel") {
      val bm = context.getSystemService(Context.BATTERY_SERVICE) as android.os.BatteryManager
      bm.getIntProperty(android.os.BatteryManager.BATTERY_PROPERTY_CAPACITY)
    }

    AsyncFunction("requestBatteryOptimizationExemption") {
      val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
        data = Uri.parse("package:${context.packageName}")
        flags = Intent.FLAG_ACTIVITY_NEW_TASK
      }
      context.startActivity(intent)
    }

    AsyncFunction("getManufacturer") {
      Build.MANUFACTURER.lowercase()
    }

    AsyncFunction("openAutoStartSettings") {
      val attempts = listOf(
        Pair("com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity"),
        Pair("com.miui.securitycenter", "com.miui.securityscan.MainActivity"),
        Pair("com.miui.securitycenter", "com.miui.securitycenter.Main")
      )
      var opened = false
      for ((pkg, cls) in attempts) {
        try {
          val intent = Intent().apply {
            component = android.content.ComponentName(pkg, cls)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
          }
          context.startActivity(intent)
          opened = true
          break
        } catch (e: Exception) { /* try next */ }
      }
      if (!opened) {
        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
          data = Uri.parse("package:${context.packageName}")
          flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
      }
      opened
    }

    // Opens Android's native sound picker. channelType is "full" or "threshold".
    // Resolves with the picked sound's URI as a string, or null if the user
    // picked "Silent"/cancelled.
    AsyncFunction("pickRingtone") { channelType: String, promise: Promise ->
      val activity = appContext.currentActivity
        ?: return@AsyncFunction promise.reject("NO_ACTIVITY", "No current activity", null)

      pendingPromise = promise
      pendingChannelType = channelType

      val currentUri = BatteryForegroundService.getSoundUri(context, channelType)
      val intent = Intent(RingtoneManager.ACTION_RINGTONE_PICKER).apply {
        putExtra(RingtoneManager.EXTRA_RINGTONE_TYPE, RingtoneManager.TYPE_ALL)
        putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_SILENT, false)
        putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_DEFAULT, true)
        putExtra(
          RingtoneManager.EXTRA_RINGTONE_TITLE,
          if (channelType == "full") "Choose Full Charge Sound" else "Choose Threshold Sound"
        )
        currentUri?.let { putExtra(RingtoneManager.EXTRA_RINGTONE_EXISTING_URI, Uri.parse(it)) }
      }
      activity.startActivityForResult(intent, REQUEST_PICK_RINGTONE)
    }

    AsyncFunction("getRingtoneTitle") { uriString: String? ->
      if (uriString.isNullOrEmpty()) return@AsyncFunction "Default"
      try {
        val ringtone = RingtoneManager.getRingtone(context, Uri.parse(uriString))
        ringtone?.getTitle(context) ?: "Default"
      } catch (e: Exception) {
        "Default"
      }
    }

    // Persists the chosen sound and tells the running service to rebuild its
    // notification channel with it (channel sound can't be changed in place).
    AsyncFunction("setChannelSound") { channelType: String, uriString: String? ->
      BatteryForegroundService.saveSoundUri(context, channelType, uriString)
      val intent = Intent(BatteryForegroundService.ACTION_UPDATE_SOUND).apply {
        setPackage(context.packageName)
        putExtra(BatteryForegroundService.EXTRA_CHANNEL_TYPE, channelType)
      }
      context.sendBroadcast(intent)
      true
    }

    OnActivityResult { _, payload ->
      if (payload.requestCode == REQUEST_PICK_RINGTONE) {
        val uri = payload.data?.getParcelableExtra<Uri>(RingtoneManager.EXTRA_RINGTONE_PICKED_URI)
        val type = pendingChannelType
        if (type != null) {
          BatteryForegroundService.saveSoundUri(context, type, uri?.toString())
          val intent = Intent(BatteryForegroundService.ACTION_UPDATE_SOUND).apply {
            setPackage(context.packageName)
            putExtra(BatteryForegroundService.EXTRA_CHANNEL_TYPE, type)
          }
          context.sendBroadcast(intent)
        }
        pendingPromise?.resolve(uri?.toString())
        pendingPromise = null
        pendingChannelType = null
      }
    }
  }
}