# VerWin

VerWin is a high-fidelity Windows desktop environment simulator. It runs the same React/TypeScript renderer in an Electron Windows shell and a Capacitor Android shell. It intentionally simulates operating system behavior rather than executing Windows binaries.

## What is implemented

- Five visual guest profiles: Windows 95, XP, 7, 10, and 11.
- Multiple instances of every profile, including multiple copies of one version.
- Independent draggable, resizable, stackable, minimizable, maximizable, closeable guest windows.
- Independent app surfaces inside each guest. Included apps are File Explorer, Notepad, Calculator, Paint, Settings, Debug Console, and About VerWin.
- Era-specific desktop wallpaper, taskbar, Start menu, borders, fonts, controls, system tray, desktop icons, and window chrome.
- Persistent geometry and Notepad contents using versioned local storage. A malformed profile falls back to a clean session.
- GPU-backed browser compositing, touch/mouse pointer events, keyboard shortcut `Ctrl/Cmd + Alt + N`, and responsive layouts for a DeX window.
- Runtime telemetry and a debug console for graceful, observable degradation.

## Quick start

```bash
npm install
npm run dev
```

Open the printed Vite URL. Use **New guest** to launch another Windows version. Drag a guest title bar to move it, drag its lower-right corner to resize it, and use the guest's Start menu or desktop icons to launch independent app windows.

## Build Windows

Requirements: Node.js 20+, Windows 10/11 for packaging, and the dependencies from `npm install`.

```powershell
npm ci
npm run test
npm run build
npm run desktop:dist
```

Artifacts are written to `release/`:

- `VerWin-1.0.0-x64.exe` — portable executable.
- `VerWin Setup 1.0.0.exe` — NSIS installer.

A directory build can be used for smoke testing with `npm run desktop:pack`. `scripts/build-windows.ps1` and `scripts/build-windows.cmd` wrap this flow.

## Android / Samsung DeX

Android packaging is intentionally a second phase so the Windows artifact can be reviewed first. The shared renderer is already Capacitor-ready:

```bash
npm install
npm run android:add       # once, creates the native Android project
npm run android:prepare   # applies manifest, Gradle, and DeX resource overlays
npm run android:sync
npm run android:open
```

The source-of-truth DeX files are under `android-template/`. See [`docs/android-dex.md`](docs/android-dex.md) for the manifest contract, signed build steps, and emulator/ADB testing commands.

## Documentation

- [`docs/technical-proposal.md`](docs/technical-proposal.md) — framework choice, architecture, emulation and window manager design.
- [`docs/android-dex.md`](docs/android-dex.md) — Android/DeX configuration and testing.
- [`docs/build-and-test.md`](docs/build-and-test.md) — build matrix, smoke tests, performance expectations, and troubleshooting.

## License posture

The application code in this repository is original. Runtime dependencies are permissively licensed (MIT/BSD/Apache families); verify the generated dependency lockfile and your distribution notices before shipping a commercial build. No Windows assets or Windows binaries are bundled.
