import type { CSSProperties } from 'react';
import { ChevronRight, Cloud, Search, Settings2, Volume2, Wifi } from 'lucide-react';
import { APP_META, APP_ORDER, DESKTOP_ICONS, profileFor } from '../data/profiles';
import type { AppId, Bounds, GuestInstance } from '../domain/types';
import type { DesktopActions } from '../state/useDesktopState';
import { WindowFrame } from './WindowFrame';
import { GuestAppContent } from './GuestAppContent';

interface GuestDesktopProps {
  guest: GuestInstance;
  actions: DesktopActions;
}

function cssVariables(guest: GuestInstance): CSSProperties {
  const profile = profileFor(guest.version);
  return {
    '--guest-desktop': profile.desktop,
    '--guest-pattern': profile.desktopPattern,
    '--guest-accent': profile.accent,
    '--guest-accent-strong': profile.accentStrong,
    '--guest-taskbar': profile.taskbar,
    '--guest-taskbar-text': profile.taskbarText,
    '--guest-window': profile.window,
    '--guest-window-text': profile.windowText,
    '--guest-border': profile.border,
    '--guest-font': profile.font,
    '--guest-radius': profile.radius
  } as CSSProperties;
}

function DesktopIcon({ icon, selected, onSelect, onOpen }: { icon: typeof DESKTOP_ICONS[number]; selected: boolean; onSelect: () => void; onOpen: () => void }) {
  return <button className={`desktop-icon ${selected ? 'selected' : ''}`} onClick={onSelect} onDoubleClick={onOpen}>
    <span className="desktop-icon-art" style={{ color: icon.color }}>{icon.icon}</span><span>{icon.label}</span>
  </button>;
}

function StartMenu({ guest, actions }: GuestDesktopProps) {
  const profile = profileFor(guest.version);
  const open = (appId: AppId) => actions.openApp(guest.id, appId);
  return <div className={`start-menu start-${profile.startStyle}`} onPointerDown={event => event.stopPropagation()}>
    <div className="start-brand"><div className="start-avatar">VW</div><div><b>VerWin User</b><small>{profile.label}</small></div></div>
    <div className="start-search"><Search size={14} /><span>Type here to search</span></div>
    <div className="start-body">
      <div className="start-pinned"><div className="start-section-title">{profile.startStyle === 'classic' ? 'Programs' : 'Pinned'} <span>All apps <ChevronRight size={13} /></span></div><div className="start-app-grid">{APP_ORDER.slice(0, 6).map(appId => <button key={appId} onClick={() => open(appId)}><span style={{ background: APP_META[appId].color }}>{APP_META[appId].icon}</span><label>{APP_META[appId].title}</label></button>)}</div></div>
      <div className="start-recommended"><div className="start-section-title">{profile.startStyle === 'classic' ? 'Documents' : 'Recommended'}</div><button onClick={() => open('notepad')}><span className="recommended-icon">▤</span><label><b>Welcome to VerWin</b><small>Just now</small></label></button><button onClick={() => open('explorer')}><span className="recommended-icon folder">▰</span><label><b>Getting Started</b><small>Today</small></label></button></div>
    </div>
    <div className="start-footer"><button><Settings2 size={15} /> Settings</button><button onClick={() => actions.closeGuest(guest.id)}><span>⏻</span> Shut down</button></div>
  </div>;
}

function GuestTaskbar({ guest, actions }: GuestDesktopProps) {
  const profile = profileFor(guest.version);
  return <div className={`guest-taskbar taskbar-${profile.taskbarMode}`} onPointerDown={event => event.stopPropagation()}>
    <button className="start-button" aria-label="Open Start menu" onClick={() => actions.toggleStart(guest.id)}>{profile.startStyle === 'classic' ? 'Start' : profile.startStyle === 'xp' ? '⊞' : profile.startStyle === 'fluent' ? <><span className="win-logo">⊞</span></> : <span className="win-logo">⊞</span>}</button>
    {profile.version === '11' && <div className="taskbar-search"><Search size={13} /><span>Search</span></div>}
    <div className="guest-taskbar-apps">{guest.apps.map(app => <button key={app.id} className={`taskbar-app ${app.state !== 'minimized' ? 'running' : ''}`} onClick={() => actions.focusApp(guest.id, app.id)}><span style={{ color: APP_META[app.appId].color }}>{APP_META[app.appId].icon}</span><span className="taskbar-app-label">{app.title}</span></button>)}</div>
    <div className="system-tray"><Cloud size={13} className="tray-cloud" /><Wifi size={13} /><Volume2 size={13} /><span className="tray-divider" /><span className="tray-clock">{new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date())}<small>{new Intl.DateTimeFormat(undefined, { month: 'numeric', day: 'numeric', year: 'numeric' }).format(new Date())}</small></span><button className="show-desktop" aria-label="Show desktop" /></div>
  </div>;
}

function DesktopContextOverlay({ guest, actions }: GuestDesktopProps) {
  return <>
    <div className="desktop-icons" onPointerDown={() => actions.selectIcon(guest.id, null)}>{DESKTOP_ICONS.map(icon => <DesktopIcon key={icon.id} icon={icon} selected={guest.selectedIcon === icon.id} onSelect={() => actions.selectIcon(guest.id, icon.id)} onOpen={() => actions.openApp(guest.id, icon.appId)} />)}</div>
    <div className="desktop-watermark"><b>VerWin</b><span>Windows {guest.version === 'xp' ? 'XP' : guest.version} simulation</span></div>
  </>;
}

export function GuestDesktop({ guest, actions }: GuestDesktopProps) {
  const profile = profileFor(guest.version);
  const visibleApps = guest.apps.filter(app => app.state !== 'minimized');
  const updateGuest = (bounds: Bounds) => actions.moveGuest(guest.id, bounds);
  return <WindowFrame title={`${profile.label} · ${profile.edition}`} icon="▣" bounds={guest.bounds} state={guest.state} className={`guest-window guest-${guest.version}`} style={{ zIndex: guest.zIndex }} chrome="guest" onMove={updateGuest} onState={state => actions.setGuestState(guest.id, state)} onClose={() => actions.closeGuest(guest.id)} onFocus={() => actions.focusGuest(guest.id)} resize>
    <div className="guest-desktop" style={cssVariables(guest)}>
      <DesktopContextOverlay guest={guest} actions={actions} />
      <div className="guest-workspace" onPointerDown={() => { actions.focusGuest(guest.id); }}>
        {visibleApps.map(app => <WindowFrame key={app.id} title={app.title} icon={APP_META[app.appId].icon} bounds={app.bounds} state={app.state} className={`guest-app guest-app-${app.appId}`} style={{ zIndex: app.zIndex }} chrome="app" onMove={(bounds: Bounds) => actions.moveApp(guest.id, app.id, bounds)} onState={state => actions.setAppState(guest.id, app.id, state)} onClose={() => actions.closeApp(guest.id, app.id)} onFocus={() => actions.focusApp(guest.id, app.id)}>
          <GuestAppContent app={app} profile={profile} guestVersion={guest.version} updatePayload={payload => actions.updateAppPayload(guest.id, app.id, payload)} />
        </WindowFrame>)}
      </div>
      {guest.startOpen && <StartMenu guest={guest} actions={actions} />}
      <GuestTaskbar guest={guest} actions={actions} />
    </div>
  </WindowFrame>;
}
