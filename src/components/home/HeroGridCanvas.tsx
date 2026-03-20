'use client';

import { useRef } from 'react';
import type { RefObject } from 'react';
import { useGridWarp } from '@/hooks/useGridWarp';

interface HeroGridCanvasProps {
  heroRef: RefObject<HTMLElement | null>;
}

export function HeroGridCanvas({ heroRef }: HeroGridCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGridWarp(canvasRef, containerRef, heroRef);

  return (
    <div className="hero-grid-bg" ref={containerRef}>
      <canvas ref={canvasRef} className="hero-grid-canvas" />
    </div>
  );
}
