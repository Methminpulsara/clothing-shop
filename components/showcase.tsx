"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { categoryLabels, photos, type Photo } from "@/lib/images";
import { useReveals } from "@/lib/use-reveals";
import { gsap } from "@/lib/gsap";
import { CursorDrivenParticleTypography } from "@/components/ui/particle-typography";

type Filter = "all" | Photo["category"];

// The layout has an intentional editorial rhythm, not a repeated card grid.
const SLOTS = [
  { span: "md:col-span-7", offset: "", reveal: "clip-up" },
  { span: "md:col-span-5", offset: "md:mt-32", reveal: "clip-left" },
  { span: "md:col-span-4 md:col-start-2", offset: "", reveal: "clip-right" },
  { span: "md:col-span-6 md:col-start-7", offset: "md:-mt-16", reveal: "clip-up" },
  { span: "md:col-span-5", offset: "md:mt-10", reveal: "clip-left" },
  { span: "md:col-span-7", offset: "", reveal: "clip-right" },
] as const;

export function Showcase() {
  const root = useRef<HTMLElement>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<Photo | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const categories = Array.from(new Set(photos.map((p) => p.category)));
  const list = filter === "all" ? photos : photos.filter((p) => p.category === filter);

  // Keep the standard section entrances, but let each filter change use one coherent GSAP sequence.
  useReveals(root);
  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = Array.from(section.querySelectorAll<HTMLElement>("[data-filter-card]"));
    if (reduced) {
      gsap.set(cards, { clearProps: "all" });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { autoAlpha: 0, y: 34, clipPath: "inset(0% 0% 8% 0%)" },
        { autoAlpha: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 0.86, ease: "power3.out", stagger: 0.065, clearProps: "opacity,visibility,transform,clipPath" },
      );
      cards.forEach((card) => {
        const image = card.querySelector<HTMLElement>("[data-filter-image]");
        if (image) {
          gsap.fromTo(
            image,
            { scale: 1.07, yPercent: -2 },
            { scale: 1.015, yPercent: 2, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 0.45 } },
          );
        }
      });
    }, section);
    return () => ctx.revert();
  }, [filter]);

  useEffect(() => {
    if (!view) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setView(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [view]);

  return (
    <section ref={root} id="collection" className="relative bg-transparent px-5 pb-32 pt-24 text-ivory md:px-10 md:pt-36">
      <div className="mx-auto max-w-[1800px]">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
          <div className="min-w-0">
            <p data-reveal="up" className="mb-6 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.3em] text-platinum" data-kinetic-text>
              <span className="inline-block h-px w-7 bg-platinum/60" /> 01 / The collection
            </p>
            <div data-reveal="up" data-kinetic-text className="max-w-[94vw]">
              <h2 className="sr-only">Pieces for the street</h2>
              <div aria-hidden="true" className="h-[34vw] min-h-[190px] w-full text-ivory md:h-[20vw] md:min-h-[230px]">
                <CursorDrivenParticleTypography text={"PIECES\nFOR THE STREET"} fontSize={230} particleDensity={8} particleSize={1.35} dispersionStrength={16} returnSpeed={0.075} maxParticles={2300} />
              </div>
            </div>
          </div>
          <div className="flex max-w-xl flex-col gap-4 md:items-end md:pb-2">
            <p className="max-w-[36ch] text-sm leading-relaxed text-platinum/70 md:text-right">Considered silhouettes. Everyday uniform. Browse the edit by category.</p>
            <div data-reveal="fade" role="group" aria-label="Filter by category" className="flex flex-wrap gap-x-5 gap-y-3 border-y border-ivory/15 py-3">
              {(["all", ...categories] as Filter[]).map((c, i) => {
                const active = filter === c;
                const amount = c === "all" ? photos.length : photos.filter((p) => p.category === c).length;
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={active}
                    data-kinetic-text
                    onClick={() => setFilter(c)}
                    className={cn("group relative inline-flex items-center gap-1.5 pb-1 text-[10px] font-medium uppercase tracking-[0.19em] transition-colors duration-500", active ? "text-ivory" : "text-platinum/55 hover:text-ivory")}
                  >
                    <span className="text-[8px] text-platinum/45">{String(i + 1).padStart(2, "0")}</span>
                    {c === "all" ? "All" : categoryLabels[c]}
                    <span className={cn("ml-0.5 text-[8px] tabular-nums transition-colors", active ? "text-ivory/65" : "text-platinum/30")}>{String(amount).padStart(2, "0")}</span>
                    <span aria-hidden="true" className={cn("absolute inset-x-0 -bottom-[13px] h-px origin-left bg-ivory transition-transform duration-500", active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-9 flex items-center justify-between border-b border-ivory/10 pb-3 text-[9px] uppercase tracking-[0.25em] text-platinum/55">
          <span aria-live="polite">Selected edit / {filter === "all" ? "All pieces" : categoryLabels[filter]}</span>
          <span>{String(list.length).padStart(2, "0")} frames <span className="mx-2 text-platinum/25">/</span> {String(photos.length).padStart(2, "0")}</span>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-20 md:mt-16 md:grid-cols-12 md:gap-y-28">
          {list.map((p, i) => {
            const slot = SLOTS[i % SLOTS.length]!;
            return (
              <li key={p.slug} data-filter-card className={cn("min-w-0", slot.span, slot.offset)}>
                <figure>
                  <button
                    type="button"
                    onClick={() => setView(p)}
                    aria-label={`View ${p.title} larger`}
                    onPointerMove={(event) => {
                      const rect = event.currentTarget.getBoundingClientRect();
                      event.currentTarget.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
                      event.currentTarget.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
                    }}
                    data-kinetic-text
                    className="group relative block w-full overflow-hidden border border-ivory/10 bg-graphite/45 text-left"
                    style={{ aspectRatio: p.aspect }}
                  >
                    <img
                      data-filter-image
                      src={p.src}
                      alt={`${p.title}: ${p.caption}`}
                      width={p.width}
                      height={p.height}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-[filter,transform] duration-[1200ms] ease-[cubic-bezier(.19,1,.22,1)] group-hover:scale-[1.055] group-hover:contrast-[1.08]"
                    />
                    <span aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "radial-gradient(260px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(235,235,240,.18), transparent 72%)" }} />
                    <span className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between border-t border-ivory/15 bg-ink/75 px-5 py-4 text-[10px] uppercase tracking-[0.22em] text-ivory backdrop-blur-md transition-transform duration-700 ease-[cubic-bezier(.19,1,.22,1)] group-hover:translate-y-0 group-focus-visible:translate-y-0">
                      <span>Open frame <span className="ml-2 text-platinum/60">/ {String(i + 1).padStart(2, "0")}</span></span>
                      <span aria-hidden="true" className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-ivory/35 transition-transform duration-500 group-hover:rotate-45">↗</span>
                    </span>
                  </button>
                  <figcaption className="mt-5 flex items-start justify-between gap-6">
                    <div>
                      <h3 data-kinetic-text className="font-display text-4xl md:text-5xl">{p.title}</h3>
                      <p className="mt-3 max-w-[32ch] text-sm text-platinum/70">{p.caption}</p>
                    </div>
                    <span className="mt-1 shrink-0 border border-ivory/20 px-3 py-1 text-[9px] font-medium uppercase tracking-[0.19em] text-platinum/80">
                      {categoryLabels[p.category]}
                    </span>
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
      </div>

      {view && (
        <div role="dialog" aria-modal="true" aria-label={view.title} className="pt-safe pb-safe fixed inset-0 z-[80] flex flex-col bg-ink/96 text-ivory backdrop-blur-xl" onClick={() => setView(null)}>
          <div className="flex items-center justify-between border-b border-ivory/15 px-5 py-4 md:px-10">
            <div>
              <p className="font-display text-3xl">{view.title}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-platinum">{categoryLabels[view.category]} / {view.caption}</p>
            </div>
            <button ref={closeRef} type="button" onClick={() => setView(null)} data-kinetic-text className="group inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em]">
              Close <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ivory/30 transition-transform duration-500 group-hover:rotate-90">×</span>
            </button>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center p-4 md:p-10">
            <img src={view.srcLarge} alt={`${view.title}: ${view.caption}`} className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}
    </section>
  );
}
