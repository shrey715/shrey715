'use client';
import { Component, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import type { PointerState } from './ParticleField';

interface FieldCanvasProps {
  className?: string;
  /** Reduced motion: render on demand only, no pointer tracking. */
  still?: boolean;
  children: (pointer: React.RefObject<PointerState>) => React.ReactNode;
}

/** Swallows WebGL context failures so the page degrades to plain type. */
class WebGLBoundary extends Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Shared shell for the particle scenes: a transparent canvas that only
 * renders while on screen, plus a window-level pointer tracker (so overlaid
 * DOM text doesn't block the cursor interaction). Touch taps briefly
 * "press" into the field too.
 */
export default function FieldCanvas({ className, still = false, children }: FieldCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<PointerState>({ x: 0, y: 0, active: false });
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: '120px 0px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (still) return;
    let releaseTimer: ReturnType<typeof setTimeout>;

    const locate = (e: PointerEvent) => {
      const el = wrapRef.current;
      if (!el) return false;
      const r = el.getBoundingClientRect();
      const inside =
        e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.current.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      return inside;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointer.current.active = locate(e);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      if (!locate(e)) return;
      pointer.current.active = true;
      clearTimeout(releaseTimer);
      releaseTimer = setTimeout(() => (pointer.current.active = false), 700);
    };
    const onLeave = () => (pointer.current.active = false);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    return () => {
      clearTimeout(releaseTimer);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [still]);

  return (
    <div ref={wrapRef} className={className} aria-hidden="true">
      <WebGLBoundary>
        <Canvas
          frameloop={still ? 'demand' : inView ? 'always' : 'never'}
          dpr={[1, 1.75]}
          camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 60 }}
          gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
          style={{ pointerEvents: 'none' }}
        >
          {children(pointer)}
        </Canvas>
      </WebGLBoundary>
    </div>
  );
}
