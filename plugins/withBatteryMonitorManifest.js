const { withAndroidManifest } = require("@expo/config-plugins");

// Adds the <service> and <receiver> entries expo-modules doesn't add for
// you automatically, since they need special attributes (foregroundServiceType,
// exported=false, boot intent-filter).
module.exports = function withBatteryMonitorManifest(config) {
  return withAndroidManifest(config, (config) => {
    const app = config.modResults.manifest.application[0];

  
        app.service = app.service || [];
    app.service.push({
      $: {
        "android:name": "expo.modules.batterymonitor.BatteryForegroundService",
        "android:foregroundServiceType": "specialUse",
        "android:exported": "false"
      },
      property: [
        {
          $: {
            "android:name": "android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE",
            "android:value": "Monitors battery charge level to deliver user-configured charge alerts"
          }
        }
      ]
    });

    app.receiver = app.receiver || [];
    app.receiver.push({
      $: {
        "android:name": "expo.modules.batterymonitor.BootReceiver",
        "android:exported": "true"
      },
      "intent-filter": [
        {
          action: [{ $: { "android:name": "android.intent.action.BOOT_COMPLETED" } }]
        }
      ]
    });

    return config;
  });
};
