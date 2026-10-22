"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const WORDS = ["Dress different", "Street cut", "Layered", "Monochrome mood", "Worn in the city", "Form & function"];

function Row({ reverse }: { reverse?: boolean }) {
  // Content is repeated so the scroll-driven offset never reveals an end.
  const items = [...WORDS, ...WORDS, ...WORDS];
  return (
    <div data-row={reverse ? "b" : "a"} className="flex w-max items-center gap-10 whitespace-nowrap will-change-transform">
      {items.map((w, i) => (
        <span key={i} className="flex items-center gap-10">
          <span className={reverse ? "font-serif text-[9vw] italic leading-none text-platinum/80 md:text-[6vw]" : "font-display text-[14vw] text-ivory md:text-[9vw]"}>
            {w}
          </span>
          <span aria-hidden="true" className="h-2.5 w-2.5 rotate-45 border border-platinum/60" />
        </span>
      ))}
    </div>
  );
}

/** Bridges hero -> collection. Two rows travel in opposite directions, driven by scroll. */
export function Marquee() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const st = { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.8 };
      gsap.fromTo(el.querySelector('[data-row="a"]'), { xPercent: 0 }, { xPercent: -30, ease: "none", scrollTrigger: st });
      gsap.fromTo(el.querySelector('[data-row="b"]'), { xPercent: -30 }, { xPercent: 0, ease: "none", scrollTrigger: st });
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={root} role="presentation" className="relative overflow-hidden border-y border-ivory/10 bg-ink/20 py-10 text-ivory md:py-14">
      <p className="sr-only">Dress different. Street cut. Layered. Monochrome mood. Worn in the city.</p>
      <div aria-hidden="true" className="flex flex-col gap-4">
        <Row />
        <Row reverse />
      </div>
    </div>
  );
}
