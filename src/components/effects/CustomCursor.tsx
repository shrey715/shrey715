'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Brutalist cursor: a single solid square that inverts whatever sits beneath it
 * (mix-blend-difference) and grows into a block over interactive elements, plus
 * a solid accent tag surfacing the hovered element's `data-cursor` label.
 * Hidden until a mouse is used (touch devices keep the native cursor).
 */
export default function CustomCursor() {
  const blockRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [usingMouse, setUsingMouse] = useState(false);
  const [label, setLabel] = useState('');

  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let animationId: number;

    const animate = () => {
      current.current.x += (target.current.x - current.current.x) * 0.3;
      current.current.y += (target.current.y - current.current.y) * 0.3;

      if (blockRef.current) {
        blockRef.current.style.transform = `translate(${current.current.x}px, ${current.current.y}px) translate(-50%, -50%)`;
      }
      if (labelRef.current) {
        labelRef.current.style.transform = `translate(${current.current.x + 22}px, ${current.current.y + 16}px)`;
      }

      animationId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      setIsVisible(true);
      if (!usingMouse) {
        setUsingMouse(true);
        document.body.style.cursor = 'none';
      }

      const el = e.target as HTMLElement;
      setIsHovering(
        el.tagName === 'A' ||
          el.tagName === 'BUTTON' ||
          el.closest('a') !== null ||
          el.closest('button') !== null,
      );

      const labelEl = el.closest('[data-cursor]');
      setLabel(labelEl ? labelEl.getAttribute('data-cursor') || '' : '');
    };

    const handleTouchStart = () => {
      setUsingMouse(false);
      setIsVisible(false);
      document.body.style.cursor = 'auto';
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => {
      if (usingMouse) setIsVisible(true);
    };

    animationId = requestAnimationFrame(animate);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.body.style.cursor = 'auto';
    };
  }, [usingMouse]);

  if (!usingMouse) return null;

  const size = isHovering || label ? 44 : 12;

  return (
    <>
      {/* Solid inverting block */}
      <div
        ref={blockRef}
        className="fixed top-0 left-0 z-[99999] pointer-events-none mix-blend-difference will-change-transform bg-white"
        style={{
          width: size,
          height: size,
          opacity: isVisible ? 1 : 0,
          transition: 'width 0.2s ease, height 0.2s ease, opacity 0.2s',
        }}
      />

      {/* Contextual label tag (solid accent, no blend) */}
      {label && (
        <div
          ref={labelRef}
          className="fixed top-0 left-0 z-[100000] pointer-events-none will-change-transform"
          style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.15s' }}
        >
          <span className="block bg-accent text-paper font-mono-label text-[10px] px-2 py-1 whitespace-nowrap">
            {label}
          </span>
        </div>
      )}
    </>
  );
}
