"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { photos } from "@/lib/images";
import { WebGLFallback } from "@/components/ui/webgl-error-boundary";
import { CursorDrivenParticleTypography } from "@/components/ui/particle-typography";

const LiquidGlassCarousel = dynamic(
  () => import("@/components/ui/liquid-glass-carousel").then((m) => m.LiquidGlassCarousel),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-transparent" /> },
);

/** Polished non-WebGL alternative: a snap-scrolling strip. */
function StaticGallery() {
  return (
    <WebGLFallback className="absolute inset-0 flex items-center">
      <ul className="no-scrollbar flex h-[70%] w-full snap-x snap-mandatory gap-3 overflow-x-auto px-5 md:px-10" aria-label="Lookbook images">
        {photos.map((p) => (
          <li key={p.slug} className="relative h-full shrink-0 snap-center" style={{ aspectRatio: p.aspect }}>
            <img src={p.src} alt={`${p.title}: ${p.caption}`} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            <span className="absolute bottom-3 left-3 text-[11px] font-medium uppercase tracking-[0.2em] text-ivory mix-blend-difference">
              {p.title}
            </span>
          </li>
        ))}
      </ul>
    </WebGLFallback>
  );
}

export function Gallery() {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Items are module-stable so the carousel engine is created once.
  const items = useMemo(() => photos.map((p) => ({ src: p.src, title: p.title, aspect: p.aspect })), []);

  // Mount the carousel only when the section approaches the viewport so its entrance plays on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setArmed(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -30% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="lookbook" aria-label="Lookbook" className="relative bg-transparent text-ivory">
      <div className="px-5 pb-8 pt-24 md:px-10 md:pt-32">
        <p data-kinetic-text className="mb-5 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.3em] text-platinum"><span className="inline-block h-px w-7 bg-platinum/60" />02 / Lookbook</p>
        <div data-kinetic-text className="max-w-[94vw]">
          <h2 className="sr-only">The exhibition</h2>
          <div aria-hidden="true" className="h-[27vw] min-h-[115px] w-full text-ivory md:h-[13vw] md:min-h-[155px]">
            <CursorDrivenParticleTypography text="THE EXHIBITION" fontSize={230} particleDensity={8} particleSize={1.35} dispersionStrength={16} returnSpeed={0.075} maxParticles={2500} />
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <p className="max-w-md text-sm leading-relaxed text-platinum/80">
            Drag, scroll sideways or use the arrow keys. Click the centred frame to focus it.
          </p>
          <div className="flex w-full max-w-[220px] items-center gap-4 text-[9px] uppercase tracking-[0.22em] text-platinum/65">
            <span>Frame {String(activeIndex + 1).padStart(2, "0")}</span>
            <span className="h-px flex-1 overflow-hidden bg-ivory/15"><span className="block h-full bg-ivory/80 transition-[width] duration-500" style={{ width: `${((activeIndex + 1) / items.length) * 100}%` }} /></span>
            <span>{String(items.length).padStart(2, "0")}</span>
          </div>
        </div>
      </div>
      <div ref={ref} className="relative h-[100svh] min-h-[560px] w-full border-y border-ivory/10">
        {armed ? (
          <LiquidGlassCarousel
            items={items}
            background="transparent"
            color="#f1eee7"
            panelHeight={460}
            gap={14}
            label="NOIR THREADS lookbook"
            fallback={<StaticGallery />}
            onActiveChange={setActiveIndex}
          />
        ) : (
          <div className="absolute inset-0 bg-transparent" />
        )}
      </div>
    </section>
  );
}
