package expo.modules.batterymonitor

import android.app.*
import android.content.*
import android.media.RingtoneManager
import android.media.MediaPlayer
import android.media.AudioAttributes
import android.net.Uri
import android.os.BatteryManager
import android.os.Build
import android.os.CountDownTimer
import android.os.IBinder
import androidx.core.app.NotificationCompat

class BatteryForegroundService : Service() {

  companion object {
    const val ACTION_UPDATE_THRESHOLD = "expo.modules.batterymonitor.UPDATE_THRESHOLD"
    const val ACTION_STOP_ALARM = "expo.modules.batterymonitor.STOP_ALARM"
    const val ACTION_UPDATE_SOUND = "expo.modules.batterymonitor.UPDATE_SOUND"
    const val EXTRA_THRESHOLD = "threshold"
    const val EXTRA_CHANNEL_TYPE = "channelType"

    private const val SERVICE_CHANNEL_ID = "battery_monitor_service"
    private const val SERVICE_NOTIF_ID = 1
    private const val FULL_CHARGE_NOTIF_ID = 1001
    private const val THRESHOLD_NOTIF_ID = 1002
    private const val AUTO_STOP_MS = 5 * 60 * 1000L
    private const val PREFS = "battery_monitor_sound_prefs"

    @Volatile var isRunning: Boolean = false
      private set

    // --- Static helpers so the Module can read/write sound prefs directly ---
    fun getSoundUri(ctx: Context, channelType: String): String? =
      ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString("${channelType}_sound_uri", null)

    private fun getSoundVersion(ctx: Context, channelType: String): Int =
      ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getInt("${channelType}_sound_version", 0)

    fun saveSoundUri(ctx: Context, channelType: String, uri: String?) {
      val prefs = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
      val newVersion = prefs.getInt("${channelType}_sound_version", 0) + 1
      prefs.edit()
        .putString("${channelType}_sound_uri", uri)
        .putInt("${channelType}_sound_version", newVersion)
        .apply()
    }

    private fun channelId(ctx: Context, channelType: String): String =
      "${channelType}_alert_v${getSoundVersion(ctx, channelType)}"
  }

  private var threshold: Int = 80
  private var mediaPlayer: MediaPlayer? = null
  private var autoStopTimer: CountDownTimer? = null
  private var fullChargeFired = false
  private var thresholdFired = false
    private var thresholdArmed = false // true once we've seen the level dip below threshold

  private val batteryReceiver = object : BroadcastReceiver() {
    override fun onReceive(ctx: Context, intent: Intent) {
      val level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
      val scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
      if (level < 0 || scale <= 0) return
      val percent = (level * 100) / scale

      val status = intent.getIntExtra(BatteryManager.EXTRA_STATUS, -1)
      val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING ||
                        status == BatteryManager.BATTERY_STATUS_FULL

      if (!isCharging) {
        fullChargeFired = false
        thresholdFired = false
        thresholdArmed = false // unplugged: require a fresh dip-below-threshold next time
        return
      }
      handleBatteryLevel(percent)
    }
  }

  private val controlReceiver = object : BroadcastReceiver() {
    override fun onReceive(ctx: Context, intent: Intent) {
      when (intent.action) {
                ACTION_UPDATE_THRESHOLD -> {
          threshold = intent.getIntExtra(EXTRA_THRESHOLD, threshold)
          thresholdFired = false
          val bm = getSystemService(Context.BATTERY_SERVICE) as BatteryManager
          val currentPercent = bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
          thresholdArmed = currentPercent < threshold
          persistRunState(running = true)
        }
        ACTION_STOP_ALARM -> stopAlarm()
        ACTION_UPDATE_SOUND -> {
          val type = intent.getStringExtra(EXTRA_CHANNEL_TYPE) ?: return
          recreateChannel(type)
        }
      }
    }
  }

  override fun onCreate() {
    super.onCreate()
    createChannels()
    registerReceiver(batteryReceiver, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
    val filter = IntentFilter().apply {
      addAction(ACTION_UPDATE_THRESHOLD)
      addAction(ACTION_STOP_ALARM)
      addAction(ACTION_UPDATE_SOUND)
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      registerReceiver(controlReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
    } else {
      registerReceiver(controlReceiver, filter)
    }
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    threshold = intent?.getIntExtra(EXTRA_THRESHOLD, threshold) ?: threshold
    isRunning = true
    persistRunState(running = true)
    startForeground(SERVICE_NOTIF_ID, buildServiceNotification())
    return START_STICKY
  }

  override fun onDestroy() {
    isRunning = false
    persistRunState(running = false)
    unregisterReceiver(batteryReceiver)
    unregisterReceiver(controlReceiver)
    stopAlarm()
    super.onDestroy()
  }

  override fun onTaskRemoved(rootIntent: Intent?) {
    super.onTaskRemoved(rootIntent)
    val restartIntent = Intent(applicationContext, BatteryForegroundService::class.java).apply {
      putExtra(EXTRA_THRESHOLD, threshold)
    }
    val pending = PendingIntent.getService(
      this, 1, restartIntent, PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE
    )
    val alarmManager = getSystemService(Context.ALARM_SERVICE) as AlarmManager
    alarmManager.set(AlarmManager.ELAPSED_REALTIME, android.os.SystemClock.elapsedRealtime() + 1000, pending)
  }

  override fun onBind(intent: Intent?): IBinder? = null

  private fun persistRunState(running: Boolean) {
    getSharedPreferences("battery_monitor_prefs", Context.MODE_PRIVATE)
      .edit()
      .putBoolean("was_running", running)
      .putInt("threshold", threshold)
      .apply()
  }

    private fun handleBatteryLevel(percent: Int) {
    if (percent < 100) fullChargeFired = false
    if (percent < threshold) {
      thresholdFired = false
      thresholdArmed = true // confirmed we're genuinely below the mark now
    }

    if (percent >= 100 && !fullChargeFired) {
      fullChargeFired = true
      fireAlert("full", FULL_CHARGE_NOTIF_ID, "Fully Charged", "Battery reached 100% — unplug soon.")
    } else if (percent in threshold..99 && !thresholdFired && thresholdArmed) {
      thresholdFired = true
      fireAlert("threshold", THRESHOLD_NOTIF_ID, "Charge Threshold Reached", "Battery reached your $threshold% mark.")
    }
  }
  private fun fireAlert(channelType: String, notifId: Int, title: String, text: String) {
    playAlarmSound(channelType)

    val stopIntent = Intent(ACTION_STOP_ALARM).apply { setPackage(packageName) }
    val stopPending = PendingIntent.getBroadcast(
      this, notifId, stopIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    val notification = NotificationCompat.Builder(this, channelId(this, channelType))
      .setContentTitle(title)
      .setContentText(text)
      .setSmallIcon(android.R.drawable.ic_lock_idle_charging)
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .setCategory(NotificationCompat.CATEGORY_ALARM)
      .setAutoCancel(false)
      .addAction(0, "Stop", stopPending)
      .build()

    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    manager.notify(notifId, notification)

    autoStopTimer?.cancel()
    autoStopTimer = object : CountDownTimer(AUTO_STOP_MS, AUTO_STOP_MS) {
      override fun onTick(millisUntilFinished: Long) {}
      override fun onFinish() = stopAlarm()
    }.start()
  }

  private fun playAlarmSound(channelType: String) {
    stopAlarm()
    val savedUri = getSoundUri(this, channelType)
    val soundUri = if (savedUri != null) {
      Uri.parse(savedUri)
    } else if (channelType == "full") {
      RingtoneManager.getActualDefaultRingtoneUri(this, RingtoneManager.TYPE_ALARM)
    } else {
      RingtoneManager.getActualDefaultRingtoneUri(this, RingtoneManager.TYPE_NOTIFICATION)
    }
    mediaPlayer = MediaPlayer().apply {
      setAudioAttributes(
        AudioAttributes.Builder()
          .setUsage(AudioAttributes.USAGE_ALARM)
          .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
          .build()
      )
      setDataSource(this@BatteryForegroundService, soundUri)
      isLooping = true
      prepare()
      start()
    }
  }

  private fun stopAlarm() {
    autoStopTimer?.cancel()
    autoStopTimer = null
    mediaPlayer?.apply {
      if (isPlaying) stop()
      release()
    }
    mediaPlayer = null
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    manager.cancel(FULL_CHARGE_NOTIF_ID)
    manager.cancel(THRESHOLD_NOTIF_ID)
  }

  private fun buildServiceNotification(): Notification {
    return NotificationCompat.Builder(this, SERVICE_CHANNEL_ID)
      .setContentTitle("Battery Monitor")
      .setContentText("Active")
      .setSmallIcon(android.R.drawable.ic_lock_idle_charging)
      .setPriority(NotificationCompat.PRIORITY_MIN)
      .setVisibility(NotificationCompat.VISIBILITY_SECRET)
      .setSilent(true)
      .setShowWhen(false)
      .setOngoing(true)
      .build()
  }

  // Deletes the old channel (previous sound) and creates a fresh one with the
  // newly chosen sound — Android forbids changing a channel's sound in place.
  private fun recreateChannel(channelType: String) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val oldVersion = getSoundVersion(this, channelType) - 1
    if (oldVersion >= 0) manager.deleteNotificationChannel("${channelType}_alert_v$oldVersion")
    createSingleChannel(channelType)
  }

  private fun createSingleChannel(channelType: String) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val name = if (channelType == "full") "Full Charge Alert" else "Threshold Alert"
    val channel = NotificationChannel(channelId(this, channelType), name, NotificationManager.IMPORTANCE_HIGH)

    val savedUri = getSoundUri(this, channelType)
    val soundUri = if (savedUri != null) {
      Uri.parse(savedUri)
    } else if (channelType == "full") {
      RingtoneManager.getActualDefaultRingtoneUri(this, RingtoneManager.TYPE_ALARM)
    } else {
      RingtoneManager.getActualDefaultRingtoneUri(this, RingtoneManager.TYPE_NOTIFICATION)
    }
    channel.setSound(
      soundUri,
      AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).build()
    )
    manager.createNotificationChannel(channel)
  }

  private fun createChannels() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    manager.createNotificationChannel(
      NotificationChannel(SERVICE_CHANNEL_ID, "Monitor Status", NotificationManager.IMPORTANCE_MIN)
    )
    createSingleChannel("full")
    createSingleChannel("threshold")
  }
}