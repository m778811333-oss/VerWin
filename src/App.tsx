import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Bug, Clock3, Cpu, HardDrive, Keyboard, Layers3, MemoryStick, Monitor, MousePointer2, Plus, RotateCcw, Settings, Sparkles, Terminal, X } from 'lucide-react';
import { APP_META, VERSION_PROFILES } from './data/profiles';
import type { WindowsVersion } from './domain/types';
import { useDesktopState } from './state/useDesktopState';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GuestDesktop } from './components/GuestDesktop';
import './styles/app.css';

const versions: WindowsVersion[] = ['95', 'xp', '7', '10', '11'];

function versionIcon(version: WindowsVersion) {
  return version === '95' ? '▦' : version === 'xp' ? '⊞' : version === '7' ? '✦' : '⊞';
}

function HostHeader({ onNew, onReset, onDebug, debugOpen }: { onNew: () => void; onReset: () => void; onDebug: () => void; debugOpen: boolean }) {
  return <header className="host-header">
    <div className="brand-lockup"><div className="brand-mark"><span>V</span><span>W</span></div><div><strong>VerWin</strong><small>Desktop environment simulator</small></div></div>
    <nav className="host-nav"><button className="active">Desktop</button><button>Sessions <span className="nav-badge">LIVE</span></button><button>Performance</button></nav>
    <div className="host-actions"><button className="icon-action" title="Reset layout" onClick={onReset}><RotateCcw size={16} /></button><button className={`icon-action ${debugOpen ? 'active' : ''}`} title="Debug console" onClick={onDebug}><Bug size={16} /></button><button className="new-session-button" onClick={onNew}><Plus size={16} /> New guest</button><div className="host-avatar">AR</div></div>
  </header>;
}

function GuestSidebar({ guests, activeId, onFocus, onNew }: { guests: ReturnType<typeof useDesktopState>['state']['guests']; activeId: string | null; onFocus: (id: string) => void; onNew: () => void }) {
  return <aside className="guest-sidebar"><div className="sidebar-heading"><div><p>WORKSPACES</p><h2>Guest sessions</h2></div><button className="round-add" onClick={onNew} aria-label="Create guest session"><Plus size={15} /></button></div><div className="session-count"><span className="online-dot" /> {guests.length} active {guests.length === 1 ? 'session' : 'sessions'}</div><div className="guest-list">{guests.map(guest => { const profile = VERSION_PROFILES[guest.version]; return <button className={`guest-list-item ${activeId === guest.id ? 'selected' : ''}`} key={guest.id} onClick={() => onFocus(guest.id)}><span className={`sidebar-version version-${guest.version}`}>{versionIcon(guest.version)}</span><span className="guest-list-copy"><b>{profile.label}</b><small>{profile.edition} <i /> {guest.apps.length} {guest.apps.length === 1 ? 'app' : 'apps'}</small></span><span className="session-state" /></button>; })}</div><div className="sidebar-divider" /><div className="sidebar-tools"><button><Layers3 size={15} /> Window manager <span>✓</span></button><button><HardDrive size={15} /> Virtual file system <span>✓</span></button><button><Activity size={15} /> GPU compositor <span>60</span></button></div><div className="sidebar-support"><Sparkles size={16} /><div><b>High fidelity mode</b><p>Each guest has its own taskbar, apps, and persistent window state.</p></div></div><div className="sidebar-bottom"><button><Settings size={15} /> Preferences</button><button><Keyboard size={15} /> Shortcuts</button></div></aside>;
}

function NewGuestDialog({ onClose, onLaunch }: { onClose: () => void; onLaunch: (version: WindowsVersion) => void }) {
  const [selected, setSelected] = useState<WindowsVersion>('11');
  return <div className="dialog-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}><div className="new-guest-dialog"><div className="dialog-heading"><div><p>CREATE WORKSPACE</p><h2>Launch a guest OS</h2></div><button className="dialog-close" onClick={onClose}><X size={18} /></button></div><p className="dialog-copy">Every guest runs independently with its own desktop, taskbar, and application windows.</p><div className="version-picker">{versions.map(version => { const profile = VERSION_PROFILES[version]; return <button key={version} className={`version-option ${selected === version ? 'selected' : ''}`} onClick={() => setSelected(version)}><span className={`picker-icon picker-${version}`}>{versionIcon(version)}</span><span><b>{profile.label}</b><small>{profile.edition}</small></span><span className="picker-radio" /></button>; })}</div><div className="dialog-footer"><span><Monitor size={14} /> GPU accelerated session</span><button className="launch-button" onClick={() => { onLaunch(selected); onClose(); }}><Plus size={15} /> Launch {VERSION_PROFILES[selected].label}</button></div></div></div>;
}

function GuestCrashCard({ title, onClose }: { title: string; onClose: () => void }) {
  return <div className="guest-crash-card"><AlertTriangle size={25} /><b>{title} stopped rendering</b><p>The rest of VerWin is still running. Close this isolated session and launch a new one.</p><button onClick={onClose}>Close session</button></div>;
}

function HostStage({ guests, actions, onNew }: { guests: ReturnType<typeof useDesktopState>['state']['guests']; actions: ReturnType<typeof useDesktopState>['actions']; onNew: () => void }) {
  const visibleGuests = guests.filter(guest => guest.state !== 'minimized');
  return <main className="host-main"><div className="stage-toolbar"><div><span className="stage-eyebrow"><span className="live-pulse" /> SIMULATION SPACE</span><h1>Virtual desktop</h1></div><div className="stage-toolbar-right"><div className="input-hint"><Keyboard size={14} /><span>Drag windows to arrange</span></div><button className="toolbar-new" onClick={onNew}><Plus size={15} /> Guest</button></div></div><div className="emulator-stage">{visibleGuests.map(guest => <div key={guest.id} className="guest-layer" style={{ zIndex: guest.zIndex }}><ErrorBoundary fallback={<GuestCrashCard title={VERSION_PROFILES[guest.version].label} onClose={() => actions.closeGuest(guest.id)} />}><GuestDesktop guest={guest} actions={actions} /></ErrorBoundary></div>)}{visibleGuests.length === 0 && <div className="empty-stage"><div className="empty-stage-icon"><Monitor size={28} /></div><h2>No guest desktops running</h2><p>Launch a Windows version to create an independent virtual desktop.</p><button onClick={onNew}><Plus size={15} /> Launch guest OS</button></div>}<div className="stage-grid" /><div className="stage-footer"><span><span className="status-dot" /> Rendering {visibleGuests.length} guest{visibleGuests.length === 1 ? '' : 's'}</span><span>Pointer &amp; keyboard bridge ready</span><span>60 FPS target</span></div></div><div className="host-dock">{guests.filter(guest => guest.state === 'minimized').map(guest => <button key={guest.id} onClick={() => actions.focusGuest(guest.id)}><span>{versionIcon(guest.version)}</span>{VERSION_PROFILES[guest.version].label}<b>Restore</b></button>)}</div></main>;
}

function Diagnostics({ guests }: { guests: ReturnType<typeof useDesktopState>['state']['guests'] }) {
  const appCount = guests.reduce((total, guest) => total + guest.apps.length, 0);
  return <div className="diagnostics"><div className="diagnostics-heading"><div><span className="stage-eyebrow">RUNTIME TELEMETRY</span><h2>Healthy simulation</h2></div><span className="telemetry-good"><span className="status-dot" /> All systems nominal</span></div><div className="metric-grid"><div><span><Cpu size={14} /> CPU</span><b>12<span>%</span></b><i><em style={{ width: '12%' }} /></i></div><div><span><MemoryStick size={14} /> Memory</span><b>{(116 + guests.length * 74)}<span> MB</span></b><i><em style={{ width: `${18 + guests.length * 6}%` }} /></i></div><div><span><Activity size={14} /> Compositor</span><b>60<span> FPS</span></b><i><em style={{ width: '98%' }} /></i></div><div><span><Layers3 size={14} /> App surfaces</span><b>{appCount}<span> open</span></b><i><em style={{ width: `${Math.min(100, appCount * 10 + 4)}%` }} /></i></div></div></div>;
}

function DebugPanel({ onClose }: { onClose: () => void }) {
  return <div className="debug-panel"><div className="debug-panel-heading"><span><Terminal size={15} /> VerWin Debug Console</span><button onClick={onClose}><X size={15} /></button></div><div className="debug-panel-body"><p><i>18:42:01</i> <b>BOOT</b> compositor ready — persistent state loaded</p><p><i>18:42:02</i> <b>INPUT</b> pointer bridge connected; resize handles enabled</p><p><i>18:42:02</i> <b>MEM</b> virtual file system mounted for all guest sessions</p><p><i>18:42:03</i> <b>READY</b> no errors reported <span className="terminal-cursor">▌</span></p></div></div>;
}

export default function App() {
  const { state, actions } = useDesktopState();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const [isDex, setIsDex] = useState(false);
  useEffect(() => {
    const detect = () => setIsDex(/SM-T|SM-X|SamsungBrowser/i.test(navigator.userAgent) && window.innerWidth >= 800 || window.innerWidth >= 1100 && window.matchMedia('(pointer: fine)').matches);
    detect(); window.addEventListener('resize', detect); return () => window.removeEventListener('resize', detect);
  }, []);

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === 'n') { event.preventDefault(); setDialogOpen(true); } };
    window.addEventListener('keydown', onShortcut); return () => window.removeEventListener('keydown', onShortcut);
  }, []);

  return <div className={`app-shell ${isDex ? 'dex-mode' : ''}`} data-platform={isDex ? 'dex' : 'standard'}>
    <HostHeader onNew={() => setDialogOpen(true)} onReset={actions.resetLayout} onDebug={() => setDebugOpen(open => !open)} debugOpen={debugOpen} />
    <div className="app-body"><GuestSidebar guests={state.guests} activeId={state.activeGuestId} onFocus={actions.focusGuest} onNew={() => setDialogOpen(true)} /><HostStage guests={state.guests} actions={actions} onNew={() => setDialogOpen(true)} /></div>
    <Diagnostics guests={state.guests} />
    <footer className="host-footer"><span>VerWin <b>v1.0.0</b></span><span><MousePointer2 size={13} /> Window surfaces are independent and persistent</span><span><Clock3 size={13} /> Session state saved automatically</span><span className="footer-platform"><Monitor size={13} /> {isDex ? 'Samsung DeX optimized' : 'Desktop mode'}</span></footer>
    {debugOpen && <DebugPanel onClose={() => setDebugOpen(false)} />}
    {dialogOpen && <NewGuestDialog onClose={() => setDialogOpen(false)} onLaunch={actions.launchGuest} />}
  </div>;
}
