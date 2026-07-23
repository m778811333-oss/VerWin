const { contextBridge } = require('electron');

// Keep the renderer browser-compatible. This small bridge is deliberately
// capability-free today, so the simulator can share exactly the same bundle
// with Capacitor on Android without exposing Node APIs to guest applications.
contextBridge.exposeInMainWorld('verwinHost', {
  platform: process.platform,
  desktop: true
});
