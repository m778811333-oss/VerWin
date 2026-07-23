import type { AppWindow, Bounds, GuestInstance, WindowState } from './types';

export interface SurfaceSize { width: number; height: number; }

/** Keep a restored surface reachable after a host resize without changing its size unexpectedly. */
export function clampBounds(bounds: Bounds, surface: SurfaceSize, minimum: Pick<Bounds, 'width' | 'height'>): Bounds {
  const width = Math.max(minimum.width, Math.min(bounds.width, Math.max(minimum.width, surface.width)));
  const height = Math.max(minimum.height, Math.min(bounds.height, Math.max(minimum.height, surface.height)));
  return { x: Math.max(0, Math.min(bounds.x, Math.max(0, surface.width - width))), y: Math.max(0, Math.min(bounds.y, Math.max(0, surface.height - height))), width, height };
}

export function nextLayer(nextZIndex: number): { zIndex: number; nextZIndex: number } {
  return { zIndex: nextZIndex, nextZIndex: nextZIndex + 1 };
}

export function toggleWindowState(state: WindowState): WindowState {
  return state === 'maximized' ? 'normal' : state === 'minimized' ? 'normal' : 'maximized';
}

export function sortByZIndex<T extends Pick<GuestInstance, 'zIndex'>>(items: T[]): T[] {
  return [...items].sort((a, b) => a.zIndex - b.zIndex);
}

export function topApp(guest: Pick<GuestInstance, 'apps'>): AppWindow | undefined {
  return guest.apps.filter(app => app.state !== 'minimized').sort((a, b) => b.zIndex - a.zIndex)[0];
}
