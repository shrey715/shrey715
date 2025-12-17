'use client';
import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [usingMouse, setUsingMouse] = useState(false);
  
  const pos = useRef({ x: 0, y: 0 });
  const dotPos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let animationId: number;
    
    const animate = () => {
      dotPos.current.x += (pos.current.x - dotPos.current.x) * 0.35;
      dotPos.current.y += (pos.current.y - dotPos.current.y) * 0.35;
      
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.15;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.15;
      
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${dotPos.current.x}px, ${dotPos.current.y}px) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%, -50%)`;
      }
      
      animationId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      setIsVisible(true);
      // Mouse movement detected - show custom cursor
      if (!usingMouse) {
        setUsingMouse(true);
        document.body.style.cursor = 'none';
      }
      
      const target = e.target as HTMLElement;
      const isClickable = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' ||
        target.closest('a') !== null ||
        target.closest('button') !== null;
      setIsHovering(isClickable);
    };

    const handleTouchStart = () => {
      // Touch detected - hide custom cursor
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

  // Don't render cursor elements if not using mouse
  if (!usingMouse) {
    return null;
  }

  return (
    <>
      {/* Dot - uses mix-blend-mode for automatic color inversion */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[99999] will-change-transform rounded-full mix-blend-difference"
        style={{
          width: isHovering ? 16 : 10,
          height: isHovering ? 16 : 10,
          background: '#ffffff',
          opacity: isVisible ? 1 : 0,
          transition: 'width 0.2s, height 0.2s, opacity 0.2s',
        }}
      />
      {/* Ring - uses mix-blend-mode for automatic color inversion */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[99998] will-change-transform rounded-full mix-blend-difference"
        style={{
          width: isHovering ? 60 : 44,
          height: isHovering ? 60 : 44,
          border: '2px solid #ffffff',
          background: isHovering ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
          opacity: isVisible ? 1 : 0,
          transition: 'width 0.3s, height 0.3s, opacity 0.2s',
        }}
      />
    </>
  );
}
