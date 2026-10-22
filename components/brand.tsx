"use client";

import { useRef } from "react";
import { photo } from "@/lib/images";
import { useReveals } from "@/lib/use-reveals";
import { CursorDrivenParticleTypography } from "@/components/ui/particle-typography";

const duo = photo("stairwell-duo");
const varsity = photo("varsity-pair");

export function Brand() {
  const root = useRef<HTMLElement>(null);
  useReveals(root);

  return (
    <section ref={root} id="about" className="relative overflow-hidden bg-transparent px-5 py-28 md:px-10 md:py-40">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(70%_80%_at_80%_45%,rgba(185,185,190,.06),transparent_70%)]" />
      <div className="relative mx-auto grid max-w-[1800px] gap-12 md:grid-cols-12">
        <div data-reveal="clip-up" className="relative overflow-hidden md:col-span-4" style={{ aspectRatio: duo.aspect }}>
          <img data-parallax src={duo.src} alt={`${duo.title}: ${duo.caption}`} width={duo.width} height={duo.height} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        </div>

        <div className="flex flex-col justify-between gap-12 md:col-span-8">
          <p data-reveal="up" className="text-[12px] font-medium uppercase tracking-[0.3em] text-platinum">
            03 / Studio
          </p>

          {/* Particle typography: the pointer scatters the letters, which then reform. */}
          <div data-reveal="fade" className="h-[48vw] min-h-[240px] text-ivory md:h-[26vw]">
            <CursorDrivenParticleTypography text={"DRESS\nDIFFERENT."} fontSize={260} particleDensity={6} particleSize={1.35} dispersionStrength={17} returnSpeed={0.075} maxParticles={4200} />
          </div>

          <div className="grid items-end gap-8 md:grid-cols-2">
            <p data-reveal="up" className="max-w-[38ch] text-lg leading-snug text-platinum md:text-xl">
              Streetwear built on silhouette and attitude. Seen in the city, shown here, and worn in the shop.
            </p>
            <div data-reveal="clip-left" className="relative ml-auto w-2/3 overflow-hidden md:w-3/4" style={{ aspectRatio: varsity.aspect }}>
              <img data-parallax src={varsity.src} alt={`${varsity.title}: ${varsity.caption}`} width={varsity.width} height={varsity.height} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
