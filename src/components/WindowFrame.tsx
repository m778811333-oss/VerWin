import { useEffect, useRef } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { Maximize2, Minimize2, Square, X } from 'lucide-react';
import type { Bounds, WindowState } from '../domain/types';
import { clampBounds } from '../domain/windowManager';

interface WindowFrameProps {
  title: string;
  icon: string;
  bounds: Bounds;
  state: WindowState;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  onMove: (bounds: Bounds) => void;
  onState: (state: WindowState) => void;
  onClose: () => void;
  onFocus: () => void;
  resize?: boolean;
  chrome?: 'guest' | 'app';
}

/**
 * A single pointer-driven frame is shared by guest desktops and guest apps.
 * Keeping the gesture logic here prevents the two window layers from slowly
 * acquiring different behavior, especially when a DeX mouse becomes a touch
 * pointer after a configuration change.
 */
export function WindowFrame({ title, icon, bounds, state, className = '', style, children, onMove, onState, onClose, onFocus, resize = true, chrome = 'app' }: WindowFrameProps) {
  const frameRef = useRef<HTMLElement | null>(null);
  const drag = useRef<{ x: number; y: number; bounds: Bounds } | null>(null);
  const resizeStart = useRef<{ x: number; y: number; bounds: Bounds } | null>(null);

  // Guest defaults are intentionally large on desktop but must become reachable
  // when the same renderer is opened in a narrow phone window.
  useEffect(() => {
    if (state === 'maximized') return;
    const parent = frameRef.current?.parentElement;
    if (!parent) return;
    const syncToSurface = () => {
      const surface = parent.getBoundingClientRect();
      if (surface.width < 1 || surface.height < 1) return;
      const safeMinimum = chrome === 'guest'
        ? { width: Math.min(560, Math.max(300, surface.width - 16)), height: Math.min(360, Math.max(240, surface.height - 48)) }
        : { width: Math.min(250, Math.max(220, surface.width - 4)), height: Math.min(160, Math.max(140, surface.height - 4)) };
      const next = clampBounds(bounds, { width: surface.width, height: surface.height }, safeMinimum);
      if (next.x !== bounds.x || next.y !== bounds.y || next.width !== bounds.width || next.height !== bounds.height) onMove(next);
    };
    syncToSurface();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(syncToSurface);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [bounds, chrome, onMove, state]);

  const beginDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (state === 'maximized') return;
    event.preventDefault();
    event.stopPropagation();
    onFocus();
    drag.current = { x: event.clientX, y: event.clientY, bounds: { ...bounds } };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    onMove({ ...drag.current.bounds, x: Math.max(0, drag.current.bounds.x + event.clientX - drag.current.x), y: Math.max(0, drag.current.bounds.y + event.clientY - drag.current.y) });
  };

  const endDrag = () => { drag.current = null; };

  const beginResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!resize || state === 'maximized') return;
    event.preventDefault();
    event.stopPropagation();
    onFocus();
    resizeStart.current = { x: event.clientX, y: event.clientY, bounds: { ...bounds } };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!resizeStart.current) return;
    const initial = resizeStart.current;
    onMove({
      ...initial.bounds,
      width: Math.max(chrome === 'guest' ? 560 : 250, initial.bounds.width + event.clientX - initial.x),
      height: Math.max(chrome === 'guest' ? 360 : 160, initial.bounds.height + event.clientY - initial.y)
    });
  };

  const endResize = () => { resizeStart.current = null; };
  const frameStyle: CSSProperties = state === 'maximized'
    ? { ...style, inset: chrome === 'guest' ? 8 : 0, zIndex: style?.zIndex }
    : { ...style, left: bounds.x, top: bounds.y, width: bounds.width, height: bounds.height, zIndex: style?.zIndex };

  return (
    <section ref={frameRef} className={`window-frame ${chrome}-frame ${state === 'maximized' ? 'is-maximized' : ''} ${className}`} style={frameStyle} onPointerDown={onFocus}>
      <div className="window-titlebar" onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
        <span className="window-title-icon" aria-hidden="true">{icon}</span>
        <span className="window-title-text">{title}</span>
        <div className="window-controls" onPointerDown={event => event.stopPropagation()}>
          <button aria-label={`Minimize ${title}`} onClick={() => onState('minimized')}><Minimize2 size={14} /></button>
          <button aria-label={`${state === 'maximized' ? 'Restore' : 'Maximize'} ${title}`} onClick={() => onState(state === 'maximized' ? 'normal' : 'maximized')}>
            {state === 'maximized' ? <Square size={12} /> : <Maximize2 size={13} />}
          </button>
          <button className="close-button" aria-label={`Close ${title}`} onClick={onClose}><X size={15} /></button>
        </div>
      </div>
      <div className="window-content">{children}</div>
      {resize && state !== 'maximized' && <div className="resize-grip" onPointerDown={beginResize} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize} aria-hidden="true" />}
    </section>
  );
}
