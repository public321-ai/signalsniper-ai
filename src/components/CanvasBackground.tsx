"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export default function CanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const colors = ["#10b981", "#06b6d4", "#3b82f6", "#8b5cf6"];
    const particles: Particle[] = [];
    const PARTICLE_COUNT = 80;
    const GRID_GAP = 60;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Candlestick data for animated chart
    const candles: { o: number; c: number; h: number; l: number; x: number }[] = [];
    const CANDLE_COUNT = 40;
    const CANDLE_WIDTH = 8;
    const CANDLE_GAP = 4;
    let basePrice = 0.6;
    for (let i = 0; i < CANDLE_COUNT; i++) {
      const change = (Math.random() - 0.48) * 0.02;
      const open = basePrice;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 0.01;
      const low = Math.min(open, close) - Math.random() * 0.01;
      candles.push({ o: open, c: close, h: high, l: low, x: i * (CANDLE_WIDTH + CANDLE_GAP) });
      basePrice = close;
    }

    let time = 0;
    let animId: number;

    function draw() {
      ctx!.clearRect(0, 0, w, h);

      // Subtle grid
      ctx!.strokeStyle = "rgba(16, 185, 129, 0.04)";
      ctx!.lineWidth = 1;
      for (let x = 0; x < w; x += GRID_GAP) {
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, h);
        ctx!.stroke();
      }
      for (let y = 0; y < h; y += GRID_GAP) {
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(w, y);
        ctx!.stroke();
      }

      // Animated sine wave
      ctx!.beginPath();
      ctx!.strokeStyle = "rgba(6, 182, 212, 0.08)";
      ctx!.lineWidth = 2;
      for (let x = 0; x < w; x += 2) {
        const y = h * 0.5 + Math.sin(x * 0.005 + time * 0.02) * 80 + Math.sin(x * 0.01 + time * 0.03) * 40;
        if (x === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }
      ctx!.stroke();

      // Second wave
      ctx!.beginPath();
      ctx!.strokeStyle = "rgba(16, 185, 129, 0.06)";
      ctx!.lineWidth = 1.5;
      for (let x = 0; x < w; x += 2) {
        const y = h * 0.6 + Math.sin(x * 0.008 - time * 0.015) * 60 + Math.cos(x * 0.003 + time * 0.02) * 30;
        if (x === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }
      ctx!.stroke();

      // Candlestick chart in bottom area
      const chartY = h * 0.75;
      const chartHeight = h * 0.15;
      const chartOffsetX = w * 0.05;

      candles.forEach((c, i) => {
        const bull = c.c >= c.o;
        const color = bull ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)";
        const WickColor = bull ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)";

        const scale = chartHeight * 5;
        const bodyTop = chartY - Math.max(c.o, c.c) * scale;
        const bodyBot = chartY - Math.min(c.o, c.c) * scale;
        const highY = chartY - c.h * scale;
        const lowY = chartY - c.l * scale;
        const cx = chartOffsetX + c.x;

        // Wick
        ctx!.beginPath();
        ctx!.strokeStyle = WickColor;
        ctx!.lineWidth = 1;
        ctx!.moveTo(cx + CANDLE_WIDTH / 2, highY);
        ctx!.lineTo(cx + CANDLE_WIDTH / 2, lowY);
        ctx!.stroke();

        // Body
        ctx!.fillStyle = color;
        ctx!.fillRect(cx, bodyTop, CANDLE_WIDTH, bodyBot - bodyTop);
      });

      // Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = p.color;
        ctx!.globalAlpha = p.alpha * (0.5 + 0.5 * Math.sin(time * 0.05 + p.x));
        ctx!.fill();
        ctx!.globalAlpha = 1;
      });

      // Connection lines between close particles
      ctx!.strokeStyle = "rgba(16, 185, 129, 0.05)";
      ctx!.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.stroke();
          }
        }
      }

      time++;
      animId = requestAnimationFrame(draw);
    }

    draw();

    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
