import { useCallback, useEffect, useState } from 'react';
import type { AppId, AppWindow, Bounds, GuestInstance, PersistedState, WindowState, WindowsVersion } from '../domain/types';
import { appTitle } from '../data/profiles';

const STORAGE_KEY = 'verwin.desktop.v1';

function id(prefix: string): string {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return `${prefix}-${random}`;
}

function appBounds(appId: AppId, offset: number): Bounds {
  const presets: Partial<Record<AppId, Bounds>> = {
    explorer: { x: 68, y: 52, width: 620, height: 420 },
    notepad: { x: 112, y: 74, width: 560, height: 390 },
    calculator: { x: 210, y: 92, width: 330, height: 470 },
    paint: { x: 170, y: 88, width: 670, height: 430 },
    settings: { x: 150, y: 74, width: 670, height: 470 },
    debug: { x: 88, y: 70, width: 700, height: 430 },
    about: { x: 250, y: 120, width: 430, height: 300 }
  };
  const preset = presets[appId] ?? presets.notepad!;
  return { ...preset, x: preset.x + offset * 22, y: preset.y + offset * 18 };
}

function createApp(appId: AppId, offset: number): AppWindow {
  return {
    id: id('app'), appId, title: appTitle(appId), bounds: appBounds(appId, offset),
    state: 'normal', zIndex: 2 + offset, payload: appId === 'notepad' ? 'Welcome to VerWin.\n\nThis is a simulated Windows desktop.\nTry launching another app from the Start menu.' : undefined
  };
}

export function createGuest(version: WindowsVersion, index = 0): GuestInstance {
  const layouts: Record<WindowsVersion, Bounds> = {
    '95': { x: 120, y: 92, width: 850, height: 560 },
    xp: { x: 250, y: 110, width: 900, height: 600 },
    '7': { x: 170, y: 78, width: 960, height: 640 },
    '10': { x: 210, y: 72, width: 980, height: 650 },
    '11': { x: 48, y: 42, width: 1020, height: 690 }
  };
  const base = layouts[version];
  return {
    id: id('guest'), version, title: `Windows ${version === 'xp' ? 'XP' : version}${index ? ` · Instance ${index + 1}` : ''}`,
    bounds: { ...base, x: base.x + index * 38, y: base.y + index * 30 }, state: 'normal', zIndex: index + 1,
    apps: [], startOpen: false, selectedIcon: null
  };
}

const initialState = (): PersistedState => {
  const first = createGuest('11');
  const second = createGuest('xp', 1);
  second.zIndex = 2;
  first.zIndex = 3;
  return { guests: [first, second], activeGuestId: first.id, nextZIndex: 4 };
};

function readInitialState(): PersistedState {
  if (typeof window === 'undefined') return initialState();
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const state = JSON.parse(stored) as PersistedState;
      if (state && Array.isArray(state.guests) && state.guests.length > 0) return state;
    }
  } catch {
    // A corrupt profile must never stop the shell from booting; start with a clean session.
  }
  return initialState();
}

export interface DesktopActions {
  launchGuest: (version: WindowsVersion) => void;
  closeGuest: (guestId: string) => void;
  focusGuest: (guestId: string) => void;
  moveGuest: (guestId: string, bounds: Bounds) => void;
  setGuestState: (guestId: string, state: WindowState) => void;
  toggleStart: (guestId: string) => void;
  selectIcon: (guestId: string, iconId: string | null) => void;
  openApp: (guestId: string, appId: AppId) => void;
  closeApp: (guestId: string, appId: string) => void;
  focusApp: (guestId: string, appId: string) => void;
  moveApp: (guestId: string, appId: string, bounds: Bounds) => void;
  setAppState: (guestId: string, appId: string, state: WindowState) => void;
  updateAppPayload: (guestId: string, appId: string, payload: string) => void;
  resetLayout: () => void;
}

export function useDesktopState(): { state: PersistedState; actions: DesktopActions } {
  const [state, setState] = useState<PersistedState>(readInitialState);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage is optional */ }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [state]);

  const nextLayer = (current: PersistedState) => ({ nextZIndex: current.nextZIndex + 1, zIndex: current.nextZIndex });

  const launchGuest = useCallback((version: WindowsVersion) => setState(current => {
    const guest = createGuest(version, current.guests.filter(item => item.version === version).length);
    const layer = nextLayer(current);
    guest.zIndex = layer.zIndex;
    return { ...current, guests: [...current.guests, guest], activeGuestId: guest.id, nextZIndex: layer.nextZIndex };
  }), []);

  const closeGuest = useCallback((guestId: string) => setState(current => {
    const guests = current.guests.filter(guest => guest.id !== guestId);
    return { ...current, guests, activeGuestId: guests.length ? guests[guests.length - 1].id : null };
  }), []);

  const focusGuest = useCallback((guestId: string) => setState(current => {
    const layer = nextLayer(current);
    return { ...current, activeGuestId: guestId, nextZIndex: layer.nextZIndex, guests: current.guests.map(guest => guest.id === guestId ? { ...guest, zIndex: layer.zIndex, state: guest.state === 'minimized' ? 'normal' : guest.state } : guest) };
  }), []);

  const moveGuest = useCallback((guestId: string, bounds: Bounds) => setState(current => ({ ...current, guests: current.guests.map(guest => guest.id === guestId ? { ...guest, bounds } : guest) })), []);
  const setGuestState = useCallback((guestId: string, windowState: WindowState) => setState(current => ({ ...current, guests: current.guests.map(guest => guest.id === guestId ? { ...guest, state: windowState } : guest) })), []);
  const toggleStart = useCallback((guestId: string) => setState(current => ({ ...current, guests: current.guests.map(guest => guest.id === guestId ? { ...guest, startOpen: !guest.startOpen } : guest) })), []);
  const selectIcon = useCallback((guestId: string, iconId: string | null) => setState(current => ({ ...current, guests: current.guests.map(guest => guest.id === guestId ? { ...guest, selectedIcon: iconId } : guest) })), []);

  const openApp = useCallback((guestId: string, appId: AppId) => setState(current => {
    const guest = current.guests.find(item => item.id === guestId);
    if (!guest) return current;
    const layer = nextLayer(current);
    const app = createApp(appId, guest.apps.length);
    app.zIndex = layer.zIndex;
    return {
      ...current, activeGuestId: guestId, nextZIndex: layer.nextZIndex,
      guests: current.guests.map(item => item.id === guestId ? { ...item, startOpen: false, apps: [...item.apps, app] } : item)
    };
  }), []);

  const closeApp = useCallback((guestId: string, appId: string) => setState(current => ({ ...current, guests: current.guests.map(guest => guest.id === guestId ? { ...guest, apps: guest.apps.filter(app => app.id !== appId) } : guest) })), []);
  const focusApp = useCallback((guestId: string, appId: string) => setState(current => {
    const layer = nextLayer(current);
    return { ...current, activeGuestId: guestId, nextZIndex: layer.nextZIndex, guests: current.guests.map(guest => guest.id === guestId ? { ...guest, apps: guest.apps.map(app => app.id === appId ? { ...app, zIndex: layer.zIndex, state: app.state === 'minimized' ? 'normal' : app.state } : app) } : guest) };
  }), []);
  const moveApp = useCallback((guestId: string, appId: string, bounds: Bounds) => setState(current => ({ ...current, guests: current.guests.map(guest => guest.id === guestId ? { ...guest, apps: guest.apps.map(app => app.id === appId ? { ...app, bounds } : app) } : guest) })), []);
  const setAppState = useCallback((guestId: string, appId: string, windowState: WindowState) => setState(current => ({ ...current, guests: current.guests.map(guest => guest.id === guestId ? { ...guest, apps: guest.apps.map(app => app.id === appId ? { ...app, state: windowState } : app) } : guest) })), []);
  const updateAppPayload = useCallback((guestId: string, appId: string, payload: string) => setState(current => ({ ...current, guests: current.guests.map(guest => guest.id === guestId ? { ...guest, apps: guest.apps.map(app => app.id === appId ? { ...app, payload } : app) } : guest) })), []);
  const resetLayout = useCallback(() => setState(initialState()), []);

  return { state, actions: { launchGuest, closeGuest, focusGuest, moveGuest, setGuestState, toggleStart, selectIcon, openApp, closeApp, focusApp, moveApp, setAppState, updateAppPayload, resetLayout } };
}
