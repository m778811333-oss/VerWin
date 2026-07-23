# Android and Samsung DeX delivery

This repository defers the native Android project generation until the Android phase is requested. The shared UI is already packaged for Capacitor. The reviewed source-of-truth native overlays are under `android-template/`.

## Required manifest contract

The generated `android/app/src/main/AndroidManifest.xml` must preserve these properties on the launcher Activity:

```xml
<activity
    android:name=".MainActivity"
    android:configChanges="orientation|screenSize|smallestScreenSize|keyboardHidden|screenLayout|uiMode"
    android:exported="true"
    android:hardwareAccelerated="true"
    android:launchMode="singleTask"
    android:resizeableActivity="true"
    android:screenOrientation="unspecified"
    android:windowSoftInputMode="adjustResize">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
```

The manifest includes `android.hardware.touchscreen` with `required="false"`, not `true`, so a DeX mouse/keyboard device is a supported target. It also advertises `android.hardware.faketouch` as optional. Do not add a touchscreen-required declaration while merging another plugin.

`android:configChanges` avoids destroying the WebView session when the Activity moves from handset to DeX. `hardwareAccelerated` keeps the CSS/Canvas/SVG compositor on the GPU. The app uses density-independent native dimensions and CSS viewport layout; no physical pixel constant is used for guest geometry.

## Generate and apply the project

```bash
npm ci
npm run build
npm run android:add       # one time; requires Android Studio / SDK
npm run android:prepare   # copies manifest, Gradle and values-* overlays
npm run android:sync
npm run android:open
```

`android:prepare` is intentionally idempotent. It fails loudly if the generated Capacitor Android project is missing rather than silently writing files into the wrong directory.

## DeX resource strategy

- `values/dimens.xml`: handset-safe paddings and touch targets.
- `values-sw600dp/dimens.xml`: tablet and DeX workspace paddings.
- `values-w480dp/dimens.xml`: wide freeform window spacing.
- `values-night/colors.xml`: stable dark host shell background.
- The web UI also detects a fine-pointer wide Samsung viewport and adds `data-platform="dex"`, where the CSS enlarges title bars and taskbar hit targets.

The `desk`/`xlarge` resource qualifiers requested by DeX integrations vary by Android version and OEM. Android's official and portable width qualifiers (`sw600dp`, `w480dp`) are the reliable baseline; the manifest's `uiMode` is observed by Android and configuration changes are delivered to the Activity. If a Samsung-specific resource split is required by a distribution build, add `values-desk/` and `values-xlarge/` alongside the supplied folders without changing the shared renderer.

## DeX validation

### Physical DeX

1. Install the debug APK on a Samsung device with DeX support.
2. Connect to DeX (USB-C/HDMI or wireless), resize VerWin as a freeform window, and switch between portrait handset and DeX.
3. Launch three guests and several apps. Verify that a mouse can drag title bars and resize grips, the keyboard can type in Notepad, and the Activity does not reset when the window is resized.
4. Turn on Android Developer options and inspect Logcat for Activity recreation or WebView renderer errors.

### AVD freeform smoke test

Use an Android 12+ x86_64 AVD with a desktop/freeform window configuration. The exact emulator UI differs by Android Studio version; enable **Freeform windows** in Developer Options where available. Install and resize the APK in a freeform window.

```bash
adb devices
adb install -r path/to/app-debug.apk
adb shell wm density 160
adb shell wm size 1080x1920
adb shell am force-stop ai.arena.verwin
adb shell monkey -p ai.arena.verwin 1
```

Restore the emulator after testing with `adb shell wm density reset` and `adb shell wm size reset`. These commands exercise the density transition; the app should retain window state because its model is CSS-pixel based and local storage is not cleared.

## Signed release APK

After Android Studio opens the generated project, create a keystore outside the repository and configure a release signing block through environment variables or CI secret files. Then:

```bash
cd android
./gradlew assembleRelease
# Windows: gradlew.bat assembleRelease
```

The signed output is `android/app/build/outputs/apk/release/app-release.apk`. A signed artifact cannot be supplied from source alone because it must be generated with the owner's private keystore. Do not commit `*.jks`, passwords, or `signing.properties`.
