export type WindowsVersion = '95' | 'xp' | '7' | '10' | '11';
export type AppId = 'explorer' | 'notepad' | 'calculator' | 'paint' | 'settings' | 'debug' | 'about';
export type WindowState = 'normal' | 'minimized' | 'maximized';

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AppWindow {
  id: string;
  appId: AppId;
  title: string;
  bounds: Bounds;
  state: WindowState;
  zIndex: number;
  payload?: string;
}

export interface GuestInstance {
  id: string;
  version: WindowsVersion;
  title: string;
  bounds: Bounds;
  state: WindowState;
  zIndex: number;
  apps: AppWindow[];
  startOpen: boolean;
  selectedIcon: string | null;
}

export interface PersistedState {
  guests: GuestInstance[];
  activeGuestId: string | null;
  nextZIndex: number;
}

export interface VersionProfile {
  version: WindowsVersion;
  label: string;
  edition: string;
  accent: string;
  accentStrong: string;
  desktop: string;
  desktopPattern: string;
  taskbar: string;
  taskbarText: string;
  window: string;
  windowText: string;
  border: string;
  font: string;
  radius: string;
  startStyle: 'classic' | 'xp' | 'aero' | 'modern' | 'fluent';
  taskbarMode: 'left' | 'center';
}

export interface DesktopIcon {
  id: string;
  label: string;
  appId: AppId;
  icon: string;
  color: string;
}
