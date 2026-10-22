"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { photo } from "@/lib/images";
import { site } from "@/lib/site";
import { CursorDrivenParticleTypography } from "@/components/ui/particle-typography";

const hero = photo("hoodie-louvre");

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const cta = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const nav = document.querySelector<HTMLElement>("[data-nav]");
    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduce: "(prefers-reduced-motion: reduce)",
        fine: "(pointer: fine)",
      },
      (ctx) => {
        const { reduce, fine } = ctx.conditions as { reduce: boolean; fine: boolean };
        const q = gsap.utils.selector(el);
        const visible = [...q("[data-hero-fade]"), ...q("[data-hero-cta]"), ...q("[data-hero-bg]"), nav].filter(Boolean);

        if (reduce) {
          gsap.set(visible, { autoAlpha: 1, clearProps: "transform" });
          gsap.set(q("[data-frame]"), { clipPath: "inset(0% 0% 0% 0%)" });
          gsap.set(q("[data-title-a], [data-title-b]"), { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)" });
          return;
        }

        // Campaign choreography: masthead, image reveal, particle-built wordmarks, then editorial metadata.
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo(q("[data-hero-bg]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.6, ease: "power2.out" }, 0);
        if (nav) tl.fromTo(nav, { autoAlpha: 0, y: -18 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.1);
        tl.fromTo(
          q("[data-frame]"),
          { clipPath: "inset(100% 0% 0% 0%)", scale: 1.04 },
          { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.8, ease: "expo.inOut" },
          0.3,
        );
        tl.fromTo(q("[data-hero-img]"), { scale: 1.22 }, { scale: 1.04, duration: 2.3, ease: "expo.out" }, 0.3);
        tl.fromTo(q("[data-title-a]"), { autoAlpha: 0, clipPath: "inset(0% 100% 0% 0%)" }, { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "expo.out" }, 1.0);
        tl.fromTo(q("[data-title-b]"), { autoAlpha: 0, clipPath: "inset(0% 100% 0% 0%)" }, { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.25, ease: "expo.out" }, 1.32);
        tl.fromTo(q("[data-hero-fade]"), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.11 }, 1.75);
        tl.fromTo(q("[data-hero-cta]"), { autoAlpha: 0, y: 15, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }, 2.25);

        const scrub = { trigger: el, start: "top top", end: "bottom top", scrub: 0.6 };
        gsap.to(q("[data-hero-img]"), { yPercent: 12, ease: "none", scrollTrigger: scrub });
        gsap.to(q("[data-frame]"), { scale: 0.93, ease: "none", scrollTrigger: scrub });
        gsap.to(q("[data-title-a]"), { xPercent: -18, ease: "none", scrollTrigger: scrub });
        gsap.to(q("[data-title-b]"), { xPercent: 12, ease: "none", scrollTrigger: scrub });
        gsap.to(q("[data-hero-ui]"), { autoAlpha: 0, y: -28, ease: "none", scrollTrigger: { ...scrub, end: "45% top" } });

        const cleanups: Array<() => void> = [];
        if (fine) {
          const frame = q("[data-depth-frame]")[0] as HTMLElement | undefined;
          const titleA = q("[data-title-a-depth]")[0] as HTMLElement | undefined;
          const titleB = q("[data-title-b-depth]")[0] as HTMLElement | undefined;
          const fx = frame ? gsap.quickTo(frame, "x", { duration: 1.1, ease: "power3.out" }) : null;
          const fy = frame ? gsap.quickTo(frame, "y", { duration: 1.1, ease: "power3.out" }) : null;
          const ax = titleA ? gsap.quickTo(titleA, "x", { duration: 1.25, ease: "power3.out" }) : null;
          const bx = titleB ? gsap.quickTo(titleB, "x", { duration: 1.25, ease: "power3.out" }) : null;
          const onMove = (e: PointerEvent) => {
            const nx = e.clientX / window.innerWidth - 0.5;
            const ny = e.clientY / window.innerHeight - 0.5;
            fx?.(nx * -22);
            fy?.(ny * -14);
            ax?.(nx * 24);
            bx?.(nx * -26);
          };
          el.addEventListener("pointermove", onMove, { passive: true });
          cleanups.push(() => el.removeEventListener("pointermove", onMove));

          const button = cta.current;
          if (button) {
            const mx = gsap.quickTo(button, "x", { duration: 0.55, ease: "power3.out" });
            const my = gsap.quickTo(button, "y", { duration: 0.55, ease: "power3.out" });
            const onCta = (e: PointerEvent) => {
              const r = button.getBoundingClientRect();
              mx((e.clientX - (r.left + r.width / 2)) * 0.18);
              my((e.clientY - (r.top + r.height / 2)) * 0.22);
            };
            const reset = () => { mx(0); my(0); };
            button.addEventListener("pointermove", onCta);
            button.addEventListener("pointerleave", reset);
            cleanups.push(() => {
              button.removeEventListener("pointermove", onCta);
              button.removeEventListener("pointerleave", reset);
            });
          }
        }
        return () => cleanups.forEach((cleanup) => cleanup());
      },
    );
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="top" className="relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-transparent md:min-h-[720px]">
      <div data-hero-bg className="hero-hidden pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_73%_45%,rgba(173,175,182,.10),transparent_70%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-ink/70 to-transparent" />
        <div className="absolute inset-y-[14%] left-[4vw] w-px bg-gradient-to-b from-transparent via-ivory/25 to-transparent" />
      </div>

      <div data-hero-fade className="hero-hidden absolute left-[7vw] top-[15svh] z-[4] flex items-center gap-3 text-[9px] uppercase tracking-[0.27em] text-platinum/80 sm:text-[10px]">
        <span className="inline-block h-px w-7 bg-platinum/65" />
        Streetwear / Editorial <span className="text-platinum/40">—</span> Vol. 01
      </div>

      {/* Large but deliberately separated from the subject: the photographic frame owns the right side. */}
      <div data-depth-frame className="pointer-events-none absolute right-[4vw] top-[20svh] z-[1] h-[45svh] w-[min(68vw,33svh)] md:right-[7vw] md:top-[10svh] md:h-[80svh] md:w-[min(56svh,42vw)]">
        <div
          data-frame
          className="hero-photo-frame relative h-full w-full overflow-hidden bg-graphite shadow-[0_32px_120px_rgba(0,0,0,.32)]"
          style={{ clipPath: "inset(100% 0% 0% 0%)" }}
        >
          <img
            data-hero-img
            src={hero.srcLarge}
            alt={`${hero.title}: ${hero.caption}`}
            width={hero.width}
            height={hero.height}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full scale-[1.04] object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-ink/10" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,9,.14),transparent_42%,rgba(8,8,9,.08))]" />
          <div className="absolute inset-[10px] border border-ivory/25" />
          <div className="absolute bottom-[7%] left-[7%] flex items-center gap-3 text-[9px] uppercase tracking-[0.25em] text-ivory/85">
            <span className="h-1.5 w-1.5 rounded-full bg-ivory/80" />
            Look 01 / {hero.title}
          </div>
          <span className="absolute right-[7%] top-[6%] font-display text-[10px] tracking-[0.24em] text-ivory/80">NT—001</span>
        </div>
      </div>

      <h1 className="sr-only" aria-label={site.name}>{site.name}</h1>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[3] text-ivory">
        <div data-title-a className="hero-hidden absolute left-[4vw] top-[13svh] block h-[17svh] w-[72vw] md:left-[4vw] md:top-[31svh] md:h-[24svh] md:w-[45vw]">
          <div data-title-a-depth className="pointer-events-auto block h-full w-full font-display text-[clamp(6rem,16vw,15rem)] leading-[.74] text-ivory mix-blend-difference">
            <CursorDrivenParticleTypography text="NOIR" fontSize={260} particleDensity={7} particleSize={1.45} dispersionStrength={15} returnSpeed={0.075} maxParticles={1850} />
          </div>
        </div>
        <div data-title-b className="hero-hidden absolute left-[4vw] top-[67svh] block h-[11svh] w-[92vw] md:left-[4.5vw] md:top-[51svh] md:h-[18svh] md:w-[47vw]">
          <div data-title-b-depth className="pointer-events-auto block h-full w-full font-display text-[clamp(3.7rem,8.6vw,8.2rem)] leading-[.78] tracking-[-.055em] text-ivory mix-blend-difference">
            <CursorDrivenParticleTypography text="THREADS" fontSize={185} particleDensity={7} particleSize={1.35} dispersionStrength={15} returnSpeed={0.075} maxParticles={1850} />
          </div>
        </div>
      </div>

      <div data-hero-ui className="absolute inset-x-5 bottom-[4.5svh] z-[5] flex items-end justify-between md:inset-x-[7vw]">
        <div className="flex max-w-[72vw] flex-col gap-4 md:max-w-[340px] md:gap-5">
          <p data-hero-fade className="hero-hidden font-serif text-[clamp(1.7rem,3vw,2.6rem)] italic leading-none text-ivory drop-shadow-[0_2px_12px_rgba(0,0,0,.4)]">
            {site.tagline}
          </p>
          <a
            ref={cta}
            data-hero-cta
            data-kinetic-text
            href="#collection"
            className="hero-hidden group inline-flex w-fit items-center gap-5 border border-ivory/50 bg-ink/15 px-5 py-3.5 text-[10px] font-medium uppercase tracking-[0.23em] text-ivory backdrop-blur-sm transition-[background,color,border] duration-500 hover:border-ivory hover:bg-ivory hover:text-ink sm:text-[11px]"
          >
            Explore the collection
            <span aria-hidden="true" className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-current transition-transform duration-500 group-hover:translate-x-1">↗</span>
          </a>
        </div>
        <div data-hero-fade className="hero-hidden hidden flex-col items-end gap-3 pb-1 text-[9px] uppercase tracking-[0.25em] text-platinum sm:flex">
          <span>Field note / 001</span>
          <span className="flex items-center gap-3">Scroll to discover <span aria-hidden="true" className="block h-px w-10 bg-platinum/65" /></span>
        </div>
      </div>

      <div data-hero-fade className="hero-hidden absolute bottom-[18svh] left-[4.5vw] z-[4] hidden flex-col gap-2 text-[9px] uppercase tracking-[0.25em] text-platinum/70 md:flex">
        <span>01 / Form</span>
        <span>02 / Attitude</span>
        <span>03 / Presence</span>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-[4vw] h-px w-[92vw] bg-gradient-to-r from-ivory/30 via-ivory/10 to-transparent" />
    </section>
  );
}
