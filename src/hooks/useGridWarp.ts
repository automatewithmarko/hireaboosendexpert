'use client';

import { useEffect } from 'react';
import type { RefObject } from 'react';

export function useGridWarp(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  containerRef: RefObject<HTMLDivElement | null>,
  heroRef: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const gridBg = containerRef.current;
    const hero = heroRef.current;
    if (!canvas || !gridBg || !hero) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let mouseX = 0, mouseY = 0, tgtX = 0, tgtY = 0;
    let inHero = false;
    let rafId: number;
    const CELL = 80;
    const SIGMA = 180;
    const DISPLACE = 0.15;
    const DEPTH = 100;
    let COLS = 18;
    let ROWS = 14;
    let dpr = window.devicePixelRatio || 1;

    function resize() {
      const r = gridBg!.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      canvas!.width = r.width * dpr;
      canvas!.height = r.height * dpr;
      canvas!.style.width = r.width + 'px';
      canvas!.style.height = r.height + 'px';
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      COLS = Math.ceil(r.width / CELL) + 1;
      ROWS = Math.ceil(r.height / CELL) + 1;
    }

    function onMouseMove(e: MouseEvent) {
      const r = hero!.getBoundingClientRect();
      inHero = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      const gr = gridBg!.getBoundingClientRect();
      tgtX = inHero ? e.clientX - gr.left : gr.width * 0.5;
      tgtY = inHero ? e.clientY - gr.top : gr.height * 0.5;
    }

    function draw() {
      const r = gridBg!.getBoundingClientRect();
      const w = r.width, h = r.height;
      if (w === 0 || h === 0) { rafId = requestAnimationFrame(draw); return; }

      if (mouseX === 0 && mouseY === 0) { mouseX = w * 0.5; mouseY = h * 0.5; tgtX = mouseX; tgtY = mouseY; }
      mouseX += (tgtX - mouseX) * 0.08;
      mouseY += (tgtY - mouseY) * 0.08;

      ctx!.save();
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx!.restore();

      ctx!.strokeStyle = 'rgba(0, 0, 0, 0.07)';
      ctx!.lineWidth = 1;

      const pts: { x: number; y: number }[][] = [];
      for (let row = 0; row < ROWS; row++) {
        pts[row] = [];
        for (let col = 0; col < COLS; col++) {
          const bx = col * CELL, by = row * CELL;
          const dx = bx - mouseX, dy = by - mouseY;
          const dist2 = dx * dx + dy * dy;
          const g = Math.exp(-dist2 / (2 * SIGMA * SIGMA));
          const ox = dx * DISPLACE * g;
          const oy = dy * DISPLACE * g;
          const scale = 1 + g * (DEPTH / 1000);
          const cx = w * 0.5, cy = h * 0.5;
          const fx = cx + (bx + ox - cx) * scale;
          const fy = cy + (by + oy - cy) * scale;
          pts[row][col] = { x: fx, y: fy };
        }
      }

      for (let col = 0; col < COLS; col++) {
        ctx!.beginPath();
        for (let row = 0; row < ROWS; row++) {
          const p = pts[row][col];
          row === 0 ? ctx!.moveTo(p.x, p.y) : ctx!.lineTo(p.x, p.y);
        }
        ctx!.stroke();
      }
      for (let row = 0; row < ROWS; row++) {
        ctx!.beginPath();
        for (let col = 0; col < COLS; col++) {
          const p = pts[row][col];
          col === 0 ? ctx!.moveTo(p.x, p.y) : ctx!.lineTo(p.x, p.y);
        }
        ctx!.stroke();
      }

      rafId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', onMouseMove);
    rafId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [canvasRef, containerRef, heroRef]);
}
