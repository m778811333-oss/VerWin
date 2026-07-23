import { useState } from 'react';
import { ChevronRight, File, Folder, FolderOpen, HardDrive, Monitor, Network, Palette, Search, Shield, SlidersHorizontal, Terminal, Wifi } from 'lucide-react';
import type { AppWindow, VersionProfile, WindowsVersion } from '../domain/types';

interface AppContentProps {
  app: AppWindow;
  profile: VersionProfile;
  guestVersion: WindowsVersion;
  updatePayload: (payload: string) => void;
}

const files = [
  { name: 'Desktop', type: 'folder', modified: 'Today' },
  { name: 'Documents', type: 'folder', modified: 'Today' },
  { name: 'Downloads', type: 'folder', modified: 'Yesterday' },
  { name: 'readme.txt', type: 'file', modified: '7/23/2026' },
  { name: 'system.ini', type: 'file', modified: '7/23/2026' }
];

function ExplorerContent({ profile }: { profile: VersionProfile }) {
  const [path, setPath] = useState('This PC');
  return <div className="explorer-app">
    <div className="app-toolbar explorer-toolbar"><button>‹</button><button>›</button><button>↑</button><div className="breadcrumb"><Monitor size={13} /> <span>This PC</span><ChevronRight size={13} /><span>{path}</span></div><button className="toolbar-search"><Search size={14} /> Search</button></div>
    <div className="explorer-body">
      <aside className="explorer-nav">
        <button className={path === 'This PC' ? 'active' : ''} onClick={() => setPath('This PC')}><Monitor size={15} /> This PC</button>
        <button onClick={() => setPath('Desktop')}><FolderOpen size={15} /> Desktop</button>
        <button onClick={() => setPath('Documents')}><Folder size={15} /> Documents</button>
        <button onClick={() => setPath('Network')}><Network size={15} /> Network</button>
        <div className="nav-divider" />
        <button onClick={() => setPath('C:')}><HardDrive size={15} /> Local Disk (C:)</button>
        <button onClick={() => setPath('D:')}><HardDrive size={15} /> VerWin Drive (D:)</button>
      </aside>
      <main className="file-list">
        <div className="file-list-heading"><span>Name</span><span>Date modified</span><span>Type</span></div>
        {files.map(file => <button className="file-row" key={file.name} onDoubleClick={() => file.type === 'folder' && setPath(file.name)}><span className="file-name">{file.type === 'folder' ? <Folder size={18} fill="#ffca3a" color="#d59700" /> : <File size={18} color={profile.accent} />}{file.name}</span><span>{file.modified}</span><span>{file.type === 'folder' ? 'File folder' : 'Text Document'}</span></button>)}
      </main>
    </div>
    <div className="explorer-status">{files.length} items &nbsp; • &nbsp; Simulated file system</div>
  </div>;
}

function NotepadContent({ app, updatePayload }: { app: AppWindow; updatePayload: (payload: string) => void }) {
  return <div className="notepad-app"><div className="menu-row"><span>File</span><span>Edit</span><span>Format</span><span>View</span><span>Help</span></div><textarea className="notepad-editor" spellCheck={false} value={app.payload ?? ''} onChange={event => updatePayload(event.target.value)} /><div className="notepad-status"><span>Ln 1, Col 1</span><span>100% &nbsp; Windows (CRLF) &nbsp; UTF-8</span></div></div>;
}

function CalculatorContent({ profile }: { profile: VersionProfile }) {
  const [value, setValue] = useState('0');
  const [stored, setStored] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const keys = ['%', 'CE', 'C', '⌫', '1/x', 'x²', '√x', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '±', '0', '.', '='];
  const calculate = (next: number) => {
    if (stored === null || !operator) return next;
    if (operator === '+') return stored + next;
    if (operator === '−') return stored - next;
    if (operator === '×') return stored * next;
    if (operator === '÷') return next === 0 ? 0 : stored / next;
    return next;
  };
  const press = (key: string) => {
    if (/^\d$/.test(key) || key === '.') { setValue(value === '0' && key !== '.' ? key : value + key); return; }
    if (['+', '−', '×', '÷'].includes(key)) { setStored(Number(value)); setOperator(key); setValue('0'); return; }
    if (key === '=') { setValue(String(calculate(Number(value)))); setStored(null); setOperator(null); return; }
    if (key === 'C' || key === 'CE') { setValue('0'); if (key === 'C') { setStored(null); setOperator(null); } return; }
    if (key === '⌫') { setValue(value.length > 1 ? value.slice(0, -1) : '0'); return; }
    if (key === '±') { setValue(String(Number(value) * -1)); return; }
    if (key === '√x') { setValue(String(Math.sqrt(Number(value)))); return; }
    if (key === 'x²') { setValue(String(Number(value) ** 2)); return; }
    if (key === '1/x') { setValue(String(1 / Number(value))); }
  };
  return <div className="calculator-app"><div className="calc-mode"><span>☰</span><strong>Standard</strong><span className="calc-history">◷</span></div><div className="calc-display">{value}</div><div className="calc-memory"><button>MC</button><button>MR</button><button>M+</button><button>M−</button><button>MS</button><button>M⌄</button></div><div className="calc-grid">{keys.map((key, index) => <button key={key} className={`${key === '=' ? 'equals' : ''} ${['+', '−', '×', '÷'].includes(key) ? 'operator' : ''}`} style={{ '--calc-accent': profile.accent } as React.CSSProperties} onClick={() => press(key)}>{key}</button>)}</div></div>;
}

function PaintContent() {
  const [color, setColor] = useState('#ff4d67');
  const [strokes, setStrokes] = useState<Array<{ color: string; points: string }>>([]);
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState<string[]>([]);
  const finish = () => { if (points.length) setStrokes(current => [...current, { color, points: points.join(' ') }]); setPoints([]); setDrawing(false); };
  return <div className="paint-app"><div className="paint-ribbon"><button className="ribbon-tool"><Palette size={18} /><span>Brushes</span></button><div className="palette">{['#111827', '#ef4444', '#f59e0b', '#facc15', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff'].map(item => <button key={item} aria-label={`Use ${item}`} style={{ background: item }} className={color === item ? 'selected' : ''} onClick={() => setColor(item)} />)}</div><span className="paint-hint">Canvas</span></div><svg className="paint-canvas" viewBox="0 0 800 420" onPointerDown={event => { const point = `${event.nativeEvent.offsetX},${event.nativeEvent.offsetY}`; setDrawing(true); setPoints([point]); }} onPointerMove={event => { if (drawing) setPoints(current => [...current, `${event.nativeEvent.offsetX},${event.nativeEvent.offsetY}`]); }} onPointerUp={finish} onPointerLeave={finish}>{strokes.map((stroke, index) => <polyline key={index} points={stroke.points} fill="none" stroke={stroke.color} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />)}{points.length > 1 && <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />}</svg><div className="paint-status">Brush &nbsp; • &nbsp; {color.toUpperCase()} &nbsp; • &nbsp; Drag on the canvas to draw</div></div>;
}

function SettingsContent({ profile, guestVersion }: { profile: VersionProfile; guestVersion: WindowsVersion }) {
  const [selected, setSelected] = useState('System');
  const settings = [{ icon: <Monitor />, name: 'System', hint: 'Display, sound, notifications' }, { icon: <Wifi />, name: 'Network & internet', hint: 'Wi-Fi, airplane mode' }, { icon: <Shield />, name: 'Privacy & security', hint: 'Windows permissions' }, { icon: <SlidersHorizontal />, name: 'Personalization', hint: 'Background, colors, themes' }];
  return <div className="settings-app"><aside className="settings-nav"><div className="settings-account"><div className="avatar">VW</div><div><b>VerWin User</b><small>Local account</small></div></div>{settings.map(item => <button key={item.name} className={selected === item.name ? 'active' : ''} onClick={() => setSelected(item.name)}>{item.icon}<span>{item.name}<small>{item.hint}</small></span></button>)}</aside><main className="settings-main"><div className="settings-search">⌕ &nbsp; Find a setting</div><h2>{selected}</h2><p className="settings-lede">{selected === 'System' ? 'Your display, sound, notifications, power, and storage.' : 'Manage your simulated desktop environment preferences.'}</p><div className="settings-cards"><div className="settings-card"><Monitor color={profile.accent} /><div><b>Display</b><p>Brightness, night light, scale and layout</p></div><ChevronRight /></div><div className="settings-card"><SlidersHorizontal color={profile.accent} /><div><b>About</b><p>VerWin {guestVersion} • Simulated hardware profile</p></div><ChevronRight /></div></div></main></div>;
}

function DebugContent({ guestVersion }: { guestVersion: WindowsVersion }) {
  return <div className="debug-app"><div className="debug-toolbar"><Terminal size={15} /> SESSION LOG <span>LIVE</span></div><div className="debug-lines"><p><i>18:42:01.002</i> <b>INFO</b> guest/{guestVersion} compositor initialized at 60fps</p><p><i>18:42:01.019</i> <b>INFO</b> window manager restored persistent bounds</p><p><i>18:42:01.044</i> <b>INFO</b> virtual file system mounted: C:\</p><p><i>18:42:02.230</i> <b>READY</b> input bridge accepting pointer and keyboard events</p><p className="cursor-line">verwin&gt; <span>_</span></p></div></div>;
}

function AboutContent({ profile }: { profile: VersionProfile }) {
  return <div className="about-app"><div className="about-logo">V<span>W</span></div><h2>VerWin</h2><p className="about-version">Desktop environment simulator · build 1.0.0</p><div className="about-divider" /><p>Running <b>{profile.label} {profile.edition}</b> as a lightweight guest session.</p><div className="about-chips"><span>GPU accelerated</span><span>Persistent state</span><span>60 FPS target</span></div><small>© 2026 VerWin Project · No Windows binaries are executed.</small></div>;
}

export function GuestAppContent({ app, profile, guestVersion, updatePayload }: AppContentProps) {
  switch (app.appId) {
    case 'explorer': return <ExplorerContent profile={profile} />;
    case 'notepad': return <NotepadContent app={app} updatePayload={updatePayload} />;
    case 'calculator': return <CalculatorContent profile={profile} />;
    case 'paint': return <PaintContent />;
    case 'settings': return <SettingsContent profile={profile} guestVersion={guestVersion} />;
    case 'debug': return <DebugContent guestVersion={guestVersion} />;
    case 'about': return <AboutContent profile={profile} />;
  }
}
