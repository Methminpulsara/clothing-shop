"use client";

import { useEffect, type DependencyList, type RefObject } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Scroll reveals for children of `root`:
 *  data-reveal="up | fade | clip-up | clip-left | clip-right"
 *  data-parallax  (put on an <img> inside an overflow-hidden wrapper)
 * Skipped entirely when the visitor prefers reduced motion.
 */
export function useReveals(root: RefObject<HTMLElement | null>, deps: DependencyList = []) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      el.querySelectorAll<HTMLElement>("[data-reveal]").forEach((node) => {
        const v = node.dataset.reveal;
        const st = { trigger: node, start: "top 88%", once: true };
        if (v === "clip-up" || v === "clip-left" || v === "clip-right") {
          const from =
            v === "clip-up" ? "inset(100% 0% 0% 0%)" : v === "clip-left" ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)";
          gsap.fromTo(
            node,
            { clipPath: from },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut", scrollTrigger: st },
          );
        } else if (v === "fade") {
          gsap.fromTo(node, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: "power2.out", scrollTrigger: st });
        } else {
          gsap.fromTo(
            node,
            { autoAlpha: 0, y: 56 },
            { autoAlpha: 1, y: 0, duration: 1.1, ease: "power3.out", scrollTrigger: st },
          );
        }
      });
      el.querySelectorAll<HTMLElement>("[data-parallax]").forEach((img) => {
        const trigger = img.parentElement ?? img;
        gsap.fromTo(
          img,
          { yPercent: -7, scale: 1.15 },
          {
            yPercent: 7,
            ease: "none",
            scrollTrigger: { trigger, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    });
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
