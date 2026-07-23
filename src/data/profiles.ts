import type { AppId, DesktopIcon, VersionProfile, WindowsVersion } from '../domain/types';

export const VERSION_PROFILES: Record<WindowsVersion, VersionProfile> = {
  '95': {
    version: '95', label: 'Windows 95', edition: 'OSR 2.5', accent: '#000080', accentStrong: '#0000aa',
    desktop: '#008080', desktopPattern: 'none', taskbar: '#c0c0c0', taskbarText: '#111', window: '#c0c0c0', windowText: '#111',
    border: '#808080', font: 'Tahoma, "MS Sans Serif", sans-serif', radius: '0px', startStyle: 'classic', taskbarMode: 'left'
  },
  xp: {
    version: 'xp', label: 'Windows XP', edition: 'Professional', accent: '#245edb', accentStrong: '#164ac1', desktop: '#3b8ed0',
    desktopPattern: 'xp', taskbar: '#245edb', taskbarText: '#fff', window: '#ece9d8', windowText: '#111', border: '#1545b2',
    font: 'Tahoma, Arial, sans-serif', radius: '5px', startStyle: 'xp', taskbarMode: 'left'
  },
  '7': {
    version: '7', label: 'Windows 7', edition: 'Ultimate', accent: '#3c8bc6', accentStrong: '#1b5f96', desktop: '#163f65',
    desktopPattern: 'aero', taskbar: 'rgba(17, 29, 42, .90)', taskbarText: '#fff', window: 'rgba(248, 251, 254, .97)', windowText: '#172334',
    border: 'rgba(121, 183, 221, .8)', font: 'Segoe UI, Arial, sans-serif', radius: '4px', startStyle: 'aero', taskbarMode: 'left'
  },
  '10': {
    version: '10', label: 'Windows 10', edition: 'Pro 22H2', accent: '#0078d4', accentStrong: '#005a9e', desktop: '#13628a',
    desktopPattern: 'ten', taskbar: '#202020', taskbarText: '#fff', window: '#fff', windowText: '#1b1b1b', border: '#c8c8c8',
    font: 'Segoe UI, Arial, sans-serif', radius: '0px', startStyle: 'modern', taskbarMode: 'left'
  },
  '11': {
    version: '11', label: 'Windows 11', edition: 'Pro 24H2', accent: '#4cc2ff', accentStrong: '#2563eb', desktop: '#172c58',
    desktopPattern: 'eleven', taskbar: 'rgba(24, 30, 45, .88)', taskbarText: '#f7f9ff', window: 'rgba(250, 251, 253, .96)', windowText: '#182236',
    border: 'rgba(255, 255, 255, .32)', font: 'Segoe UI Variable, Segoe UI, Arial, sans-serif', radius: '10px', startStyle: 'fluent', taskbarMode: 'center'
  }
};

export const DESKTOP_ICONS: DesktopIcon[] = [
  { id: 'pc', label: 'This PC', appId: 'explorer', icon: '▣', color: '#dcecff' },
  { id: 'documents', label: 'Documents', appId: 'explorer', icon: '▰', color: '#ffd95c' },
  { id: 'notepad', label: 'Notepad', appId: 'notepad', icon: '▤', color: '#f5f8ff' },
  { id: 'recycle', label: 'Recycle Bin', appId: 'explorer', icon: '♻', color: '#eaf6ff' }
];

export const APP_META: Record<AppId, { title: string; icon: string; color: string }> = {
  explorer: { title: 'File Explorer', icon: '▰', color: '#ffca3a' },
  notepad: { title: 'Notepad', icon: '▤', color: '#e8f0ff' },
  calculator: { title: 'Calculator', icon: '▦', color: '#77b7ff' },
  paint: { title: 'Paint', icon: '◒', color: '#ff8f70' },
  settings: { title: 'Settings', icon: '⚙', color: '#9ca9bd' },
  debug: { title: 'VerWin Debug Console', icon: '›_', color: '#7ee787' },
  about: { title: 'About VerWin', icon: '◆', color: '#4cc2ff' }
};

export const APP_ORDER: AppId[] = ['explorer', 'notepad', 'calculator', 'paint', 'settings', 'debug'];

export function profileFor(version: WindowsVersion): VersionProfile {
  return VERSION_PROFILES[version];
}

export function appTitle(appId: AppId): string {
  return APP_META[appId].title;
}
