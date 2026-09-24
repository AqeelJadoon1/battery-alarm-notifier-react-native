# Battery Notify App — Stage 1 (core service + notifications)

This stage contains the working core: the native always-on battery watcher,
dual notification channels/sounds, auto-stop, dedupe-safe alerts, and the
storage/hook layer the UI will plug into in Stage 2.

## Setup (run these on your HP Victus laptop)

1. Extract this folder into `C:\Users\Aqeel\Desktop\battery-notify-app`
2. Install Node.js LTS if you don't have it, then:
   ```
   cd C:\Users\Aqeel\Desktop\battery-notify-app
   npm install
   npm install -g eas-cli
   ```
3. Generate the native Android project (this reads `app.config.js` +
   `plugins/withBatteryMonitorManifest.js` and wires everything up):
   ```
   npx expo prebuild --platform android
   ```
4. Run on your Poco X3 GT over USB (enable Developer Options + USB
   debugging on the phone first):

   ```
   npm run android

   ```

   This builds and installs a debug dev-client build directly.

## Building the final standalone APK

```
eas login
eas build:configure
eas build --platform android --profile preview
```

`eas build` gives you a download link for a real installable `.apk` — no
Android Studio required, though having Android Studio installed locally
lets `expo run:android` work faster for day-to-day testing.

## First-launch checklist inside the app (Stage 2 will build the UI for this)

- Grant notification permission (Android prompt)
- Grant "Ignore battery optimizations" — **critical on Poco/MIUI**, otherwise
  MIUI's own battery manager can kill the service. Also manually lock the
  app in Recents (long-press app icon in recents → lock) on MIUI.
- Set your threshold and tap Save

## What's NOT built yet (Stage 2 / 3)

- Screens (Home, Settings) and components (BatteryRing, ThresholdSlider, StopButton)
- Polished UI/theme
- App icon + notification icon assets
- In-app "Stop" button wired to `stopAlarmSound()`
- First-run permission onboarding flow

Say the word and I'll build Stage 2 (UI) next.
