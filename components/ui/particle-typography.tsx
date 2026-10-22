"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface CursorDrivenParticleTypographyProps {
  className?: string;
  /** Text to render. Use "\n" for multiple lines. */
  text: string;
  /** Maximum font size in px (text is shrunk to fit the container). */
  fontSize?: number;
  /** Defaults to the font inherited from the container. */
  fontFamily?: string;
  particleSize?: number;
  /** Pixel step between particles (lower = more particles, minimum 1). */
  particleDensity?: number;
  dispersionStrength?: number;
  returnSpeed?: number;
  /** Overrides the inherited text colour. */
  color?: string;
  /** Hard cap on particle count; density is coarsened automatically to stay under it. */
  maxParticles?: number;
}

const INTERACTION_RADIUS = 120;

class Particle {
  x: number;
  y: number;
  vx = (Math.random() - 0.5) * 5;
  vy = (Math.random() - 0.5) * 5;

  constructor(
    public originX: number,
    public originY: number,
    private dispersion: number,
    private returnSpd: number,
  ) {
    this.x = originX + (Math.random() - 0.5) * 10;
    this.y = originY + (Math.random() - 0.5) * 10;
  }

  update(mouseX: number, mouseY: number) {
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distance = Math.hypot(dx, dy);

    if (distance < INTERACTION_RADIUS && mouseX !== -1000 && mouseY !== -1000) {
      let fx: number;
      let fy: number;
      if (distance > 0.001) {
        fx = dx / distance;
        fy = dy / distance;
      } else {
        // Pointer exactly on the particle: pick a random direction instead of dividing by zero (NaN).
        const a = Math.random() * Math.PI * 2;
        fx = Math.cos(a);
        fy = Math.sin(a);
      }
      const force = (INTERACTION_RADIUS - distance) / INTERACTION_RADIUS;
      this.vx -= fx * force * this.dispersion;
      this.vy -= fy * force * this.dispersion;
    }

    this.vx += (this.originX - this.x) * this.returnSpd;
    this.vy += (this.originY - this.y) * this.returnSpd;
    this.vx *= 0.85;
    this.vy *= 0.85;

    this.x += this.vx;
    this.y += this.vy;
  }
}

export function CursorDrivenParticleTypography({
  className,
  text,
  fontSize = 120,
  fontFamily,
  particleSize = 1.5,
  particleDensity = 6,
  dispersionStrength = 15,
  returnSpeed = 0.08,
  color,
  maxParticles = 5000,
}: CursorDrivenParticleTypographyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = motionPreference.matches;
    let raf = 0;
    let running = false;
    let inView = false;
    let disposed = false;
    let particles: Particle[] = [];
    let mouseX = -1000;
    let mouseY = -1000;
    let w = 0;
    let h = 0;
    let fillColor = "#000";
    let initTimer = 0;

    const lines = text.split("\n");

    const init = () => {
      w = container.clientWidth;
      h = container.clientHeight;
      if (w === 0 || h === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // reset so repeated init() never compounds the scale

      const cs = window.getComputedStyle(container);
      fillColor = color || cs.color || "#000";
      const family = fontFamily || cs.fontFamily || "sans-serif";

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = fillColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Fit: widest line within 92% of width, all lines within 90% of height.
      ctx.font = `bold 100px ${family}`;
      const widest = Math.max(...lines.map((l) => ctx.measureText(l).width), 1);
      const lineH = 0.95;
      const fitW = (w * 0.92 * 100) / widest;
      const fitH = (h * 0.9) / (lines.length * lineH);
      const size = Math.max(10, Math.min(fontSize, fitW, fitH));
      ctx.font = `bold ${size}px ${family}`;
      const totalH = size * lineH * lines.length;
      lines.forEach((l, i) => {
        ctx.fillText(l, w / 2, h / 2 - totalH / 2 + size * lineH * (i + 0.5));
      });

      if (reduced) return; // static text only

      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let step = Math.max(1, Math.floor(particleDensity * dpr));
      const build = (s: number) => {
        const out: Particle[] = [];
        for (let y = 0; y < data.height; y += s) {
          for (let x = 0; x < data.width; x += s) {
            if ((data.data[(y * data.width + x) * 4 + 3] ?? 0) > 128) {
              out.push(new Particle(x / dpr, y / dpr, dispersionStrength, returnSpeed));
            }
          }
        }
        return out;
      };
      particles = build(step);
      while (particles.length > maxParticles && step < 64) {
        step += 1;
        particles = build(step);
      }
      ctx.clearRect(0, 0, w, h);
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      for (const p of particles) {
        p.update(mouseX, mouseY);
        ctx.moveTo(p.x + particleSize, p.y);
        ctx.arc(p.x, p.y, particleSize, 0, Math.PI * 2);
      }
      ctx.fill(); // one fill call for all particles
      raf = requestAnimationFrame(frame);
    };
    const play = () => {
      if (reduced || running || !inView || disposed || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const pause = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const setPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseX = e.clientX - r.left;
      mouseY = e.clientY - r.top;
    };
    const clearPointer = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    // Wait for fonts so the particle map uses the real typeface.
    const start = () => {
      initTimer = window.setTimeout(() => {
        if (disposed) return;
        init();
        play();
      }, 50);
    };
    if (document.fonts?.ready) document.fonts.ready.then(() => !disposed && start());
    else start();

    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => !disposed && init(), 150);
    });
    ro.observe(container);
    const themeObserver = new MutationObserver(() => init());
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const io = new IntersectionObserver(([e]) => {
      inView = e?.isIntersecting ?? true;
      if (inView) play();
      else pause();
    });
    io.observe(container);
    const onVis = () => (document.hidden ? pause() : play());
    document.addEventListener("visibilitychange", onVis);
    const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
      reduced = event.matches;
      init();
      if (reduced) pause();
      else play();
    };
    motionPreference.addEventListener("change", onMotionPreferenceChange);

    // Pointer events cover mouse, pen and touch (touch-action: pan-y keeps page scrolling usable).
    canvas.addEventListener("pointermove", setPointer);
    canvas.addEventListener("pointerdown", setPointer);
    canvas.addEventListener("pointerleave", clearPointer);
    canvas.addEventListener("pointerup", clearPointer);
    canvas.addEventListener("pointercancel", clearPointer);

    return () => {
      disposed = true;
      window.clearTimeout(initTimer);
      window.clearTimeout(resizeTimer);
      pause();
      ro.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      motionPreference.removeEventListener("change", onMotionPreferenceChange);
      canvas.removeEventListener("pointermove", setPointer);
      canvas.removeEventListener("pointerdown", setPointer);
      canvas.removeEventListener("pointerleave", clearPointer);
      canvas.removeEventListener("pointerup", clearPointer);
      canvas.removeEventListener("pointercancel", clearPointer);
    };
  }, [text, fontSize, fontFamily, particleSize, particleDensity, dispersionStrength, returnSpeed, color, maxParticles]);

  return (
    <div
      ref={containerRef}
      className={cn("relative flex h-full min-h-[240px] w-full items-center justify-center", className)}
    >
      <span className="sr-only">{text.replace(/\n/g, " ")}</span>
      <canvas ref={canvasRef} aria-hidden="true" className="block h-full w-full" style={{ touchAction: "pan-y" }} />
    </div>
  );
}
