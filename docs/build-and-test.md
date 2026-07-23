# Build, test, and troubleshooting

## Windows smoke test

```bash
npm ci
npm test
npm run build
```

For browser validation run `npm run dev`. For a packaged desktop run `npm run desktop:dev` on Windows, or create artifacts with `npm run desktop:dist`.

### Acceptance checklist

1. Click **New guest**, launch all five profiles, and launch a second copy of Windows 10. Each entry should be independently selectable in the Guest sessions sidebar.
2. Drag a guest title bar. Resize it from the lower-right corner. Minimize it and restore it from the host dock.
3. Open Explorer, Notepad, Calculator, Paint, Settings, and Debug Console from a guest Start menu. Move overlapping app windows and verify their title bar controls affect only that app.
4. Open the same app twice. Each surface should have its own title bar, bounds, z-order, and close button.
5. Type into Notepad, reload the page, and verify the guest and app bounds plus text are restored.
6. Click the host Debug button and confirm the shell remains responsive while the drawer is open.
7. Run with three guests and inspect the Performance panel/telemetry. Electron DevTools' Performance tab should show no long pointer-move task.

## Unit tests

`tests/windowManager.test.ts` covers geometry clamping, layer allocation, state transitions, stacking, profile tokens, and guest identity creation. Add tests for new domain transitions before changing the schema.

## Android phase two

The Capacitor project is generated once by `npm run android:add`. Then run `npm run android:prepare`, which copies the reviewed native overlays from `android-template` into the generated project. Android Studio should use compile/target SDK 35 and min SDK 24.

```bash
npm run android:sync
npm run android:open
```

In Android Studio choose a debug device and run. For a release APK configure `VERWIN_KEYSTORE_FILE`, `VERWIN_KEYSTORE_PASSWORD`, `VERWIN_KEY_ALIAS`, and `VERWIN_KEY_PASSWORD` outside the repository; never put secrets in `gradle.properties` committed to source.

## Troubleshooting

### `electron-builder` cannot create a Windows artifact

Packaging a Windows `.exe` is most reliable on Windows because native signing and the portable target use the Windows toolchain. Run `npm ci`, delete `node_modules` and `package-lock.json` only as a last resort, then run `npm run desktop:dist` from PowerShell. For local UI validation `npm run build && npx electron .` does not require an installer.

### The browser shows a blank page

Check that `npm run build` completed and that `dist/index.html` exists. Electron must be launched from the repository root so the relative `dist` path resolves. Do not open `dist/index.html` with a browser extension that blocks JavaScript modules.

### Guest windows jump after a display or DeX resize

Bounds are stored in CSS pixels and are intentionally kept between sessions. Use **Reset layout** to create safe defaults, or clear the `verwin.desktop.v1` local-storage key. The pointer implementation uses client pixels; it is not tied to physical density.

### Touch drag stops unexpectedly

Use a current Capacitor WebView. The frame uses `setPointerCapture`, not a touch-only event. Confirm the generated Android Activity has hardware acceleration and that the DeX manifest overlay from `android-template` was applied.

### Android build complains about SDK or Java

Install the Android SDK platform matching `compileSdk 35`, Android build tools, and the JDK version required by the installed Android Gradle Plugin. Capacitor 7 currently expects a modern Android Studio/JDK setup. Run `npx cap doctor` and open the generated `android/` project in Android Studio.

### APK is not resizeable in DeX

Inspect the merged manifest in Android Studio's Merged Manifest view. It must contain `android:resizeableActivity="true"`, must not require a touchscreen, and must retain the listed `configChanges`. Re-run `npm run android:prepare` after `npx cap add android` or a Capacitor regeneration.

### A saved session is corrupted

The app catches JSON/storage errors and boots a clean default profile. Clear the site/app data if you need to remove the saved layout. No guest should be able to terminate the host because guest state is data, not a separate process.
