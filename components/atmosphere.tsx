"use client";

import { useEffect } from "react";
import { AnimatedGradient } from "@/components/ui/animated-gradient";

/** One continuous, cursor-reactive monochrome light field behind every section. */
export function Atmosphere() {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let x = window.innerWidth * 0.5;
    let y = window.innerHeight * 0.45;
    let tx = x;
    let ty = y;
    const write = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      root.style.setProperty("--pointer-x", `${x}px`);
      root.style.setProperty("--pointer-y", `${y}px`);
      if (Math.abs(tx - x) > 0.4 || Math.abs(ty - y) > 0.4) raf = requestAnimationFrame(write);
      else raf = 0;
    };
    const move = (event: PointerEvent) => {
      tx = event.clientX;
      ty = event.clientY;
      if (reduce) {
        x = tx;
        y = ty;
        root.style.setProperty("--pointer-x", `${x}px`);
        root.style.setProperty("--pointer-y", `${y}px`);
        return;
      }
      if (!raf) raf = requestAnimationFrame(write);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-ink">
      <AnimatedGradient
        config={{ preset: "Noir", speed: 4 }}
        noise={{ opacity: 0.22, scale: 1.15 }}
        maxPixelRatio={1.25}
        interactive
      />
      <div className="absolute inset-0 bg-[radial-gradient(100%_85%_at_50%_20%,rgba(100,100,108,0.10)_0%,transparent_58%,rgba(0,0,0,0.42)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35" />
    </div>
  );
}
