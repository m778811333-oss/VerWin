import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.arena.verwin',
  appName: 'VerWin',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: {
    backgroundColor: '#0c1221'
  }
};

export default config;
