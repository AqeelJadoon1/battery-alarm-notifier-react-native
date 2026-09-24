export default {
  expo: {
    name: "Battery Notify",
    slug: "battery-notify-app",
    version: "1.0.0",
    orientation: "portrait",
    //userInterfaceStyle: "automatic",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash-icon.png",
      backgroundColor: "#0B0E11",
      resizeMode: "contain"
    },
    android: {
      package: "com.aqeel.batterynotify",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon-foreground.png",
        backgroundColor: "#0B0E11"
      },
      permissions: [
        "FOREGROUND_SERVICE",
        "FOREGROUND_SERVICE_SPECIAL_USE",
        "RECEIVE_BOOT_COMPLETED",
        "POST_NOTIFICATIONS",
        "REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
        "WAKE_LOCK",
        "VIBRATE"
      ]
    },
    plugins: [
      "expo-dev-client",
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#00E5A0"
        }
      ],
      "./plugins/withBatteryMonitorManifest.js"
    ]
  }
};