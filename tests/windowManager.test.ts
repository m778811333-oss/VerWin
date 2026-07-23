import { describe, expect, it } from 'vitest';
import { DESKTOP_ICONS, VERSION_PROFILES } from '../src/data/profiles';
import { clampBounds, nextLayer, sortByZIndex, toggleWindowState, topApp } from '../src/domain/windowManager';
import { createGuest } from '../src/state/useDesktopState';

describe('window manager geometry', () => {
  it('keeps a restored window inside a resized surface', () => {
    expect(clampBounds({ x: 900, y: 700, width: 640, height: 420 }, { width: 1024, height: 700 }, { width: 250, height: 160 }))
      .toEqual({ x: 384, y: 280, width: 640, height: 420 });
  });

  it('honors minimum size when the available surface is smaller', () => {
    expect(clampBounds({ x: -10, y: -4, width: 100, height: 100 }, { width: 220, height: 150 }, { width: 250, height: 160 }))
      .toEqual({ x: 0, y: 0, width: 250, height: 160 });
  });

  it('allocates monotonically increasing layers', () => {
    expect(nextLayer(8)).toEqual({ zIndex: 8, nextZIndex: 9 });
    expect(nextLayer(9)).toEqual({ zIndex: 9, nextZIndex: 10 });
  });

  it('toggles normal, maximized, and minimized states to normal', () => {
    expect(toggleWindowState('normal')).toBe('maximized');
    expect(toggleWindowState('maximized')).toBe('normal');
    expect(toggleWindowState('minimized')).toBe('normal');
  });

  it('returns surfaces in visual stacking order and finds the top app', () => {
    const guest = createGuest('10');
    const apps = [
      { id: 'a', appId: 'notepad' as const, title: 'Note', bounds: { x: 0, y: 0, width: 300, height: 200 }, state: 'normal' as const, zIndex: 4 },
      { id: 'b', appId: 'paint' as const, title: 'Paint', bounds: { x: 0, y: 0, width: 300, height: 200 }, state: 'minimized' as const, zIndex: 10 }
    ];
    expect(sortByZIndex([{ zIndex: 10 }, { zIndex: 2 }, { zIndex: 6 }]).map(item => item.zIndex)).toEqual([2, 6, 10]);
    expect(topApp({ ...guest, apps })).toMatchObject({ id: 'a' });
  });
});

describe('guest profiles and defaults', () => {
  it('ships five distinct eras with authentic visual tokens', () => {
    expect(Object.keys(VERSION_PROFILES).sort()).toEqual(['10', '11', '7', '95', 'xp']);
    expect(VERSION_PROFILES['95'].taskbar).toBe('#c0c0c0');
    expect(VERSION_PROFILES.xp.startStyle).toBe('xp');
    expect(VERSION_PROFILES['11'].startStyle).toBe('fluent');
  });

  it('creates independent guest identities and desktop icons', () => {
    const a = createGuest('10');
    const b = createGuest('10', 1);
    expect(a.id).not.toBe(b.id);
    expect(b.title).toContain('Instance 2');
    expect(DESKTOP_ICONS.map(icon => icon.appId)).toContain('notepad');
  });
});
