"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

const links = [
  { href: "#collection", label: "Collection" },
  { href: "#lookbook", label: "Lookbook" },
  { href: "#about", label: "Studio" },
  { href: "#visit", label: "Visit" },
];

function Wordmark({ className }: { className?: string }) {
  return (
    <a href="#top" aria-label={`${site.name}, back to top`} className={cn("group flex items-center gap-3", className)} data-kinetic-text>
      <span aria-hidden="true" className="relative flex h-10 w-10 items-center justify-center border border-ivory/35 font-display text-[25px] leading-none tracking-[-0.12em] transition-[border-color,transform] duration-700 group-hover:-rotate-3 group-hover:border-ivory/80">
        N<span className="ml-[-2px] mt-3 font-serif text-[18px] font-normal italic text-platinum/80">T</span>
        <span className="absolute -bottom-[3px] -right-[3px] h-2 w-2 bg-ivory" />
      </span>
      <span className="flex flex-col gap-[3px] leading-none">
        <span className="font-display text-[14px] tracking-[0.18em]">NOIR</span>
        <span className="font-serif text-[12px] italic tracking-[0.2em] text-platinum/75 transition-colors duration-500 group-hover:text-ivory">THREADS</span>
      </span>
      <span className="ml-3 hidden self-stretch border-l border-ivory/15 pl-3 pt-[2px] text-[8px] uppercase leading-[1.7] tracking-[0.2em] text-platinum/50 xl:block">Independent<br />uniform / 001</span>
    </a>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [activeSection, setActiveSection] = useState("#top");
  const overlayRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("#top, #collection, #lookbook, #about, #visit"));
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top - window.innerHeight * 0.36) - Math.abs(b.boundingClientRect.top - window.innerHeight * 0.36));
        if (visible[0]?.target instanceof HTMLElement) setActiveSection(`#${visible[0].target.id}`);
      },
      { rootMargin: "-18% 0px -58% 0px", threshold: [0, 0.1, 0.4] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Build the overlay timeline once; play forward to open, reverse to close.
  useEffect(() => {
    const ov = overlayRef.current;
    if (!ov) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const k = reduced ? 0.001 : 1;
    const ctx = gsap.context(() => {
      const items = ov.querySelectorAll("[data-menu-item]");
      const tl = gsap.timeline({
        paused: true,
        onReverseComplete: () => {
          gsap.set(ov, { autoAlpha: 0 });
        },
      });
      tl.set(ov, { autoAlpha: 1 });
      tl.fromTo(
        ov,
        { clipPath: "circle(0% at calc(100% - 2.75rem) 2.75rem)" },
        { clipPath: "circle(150% at calc(100% - 2.75rem) 2.75rem)", duration: 0.9 * k, ease: "expo.inOut" },
      );
      tl.fromTo(
        items,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.9 * k, ease: "power4.out", stagger: 0.07 * k },
        0.35 * k,
      );
      tl.fromTo("[data-menu-foot]", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6 * k }, 0.8 * k);
      tlRef.current = tl;
    }, ov);
    return () => {
      ctx.revert();
      tlRef.current = null;
    };
  }, []);

  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;
    const previousOverflow = document.body.style.overflow;
    if (open) {
      document.body.style.overflow = "hidden";
      tl.play();
    } else {
      document.body.style.overflow = previousOverflow;
      tl.reverse();
    }
    return () => {
      if (open) document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    overlayRef.current?.querySelector<HTMLElement>("[data-menu-item]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = overlayRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    const mq = window.matchMedia("(min-width: 768px)");
    const onMq = () => mq.matches && close();
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open, close]);

  return (
    <>
      <header
        data-nav
        id="site-nav"
        className={cn(
          "pt-safe fixed inset-x-0 top-0 z-50 text-ivory transition-[background-color,backdrop-filter] duration-500",
          solid && !open ? "bg-ink/80 backdrop-blur-md" : "bg-transparent",
        )}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-[72px] max-w-[1800px] items-center justify-between px-5 md:px-10"
        >
          <Wordmark />
          <ul className="hidden items-center gap-8 md:flex lg:gap-10">
            {links.map((l, i) => {
              const active = activeSection === l.href;
              return (
                <li key={l.href}>
                  <a
                    href={l.href}
                    aria-current={active ? "location" : undefined}
                    data-kinetic-text
                    className={cn(
                      "group relative inline-flex items-center gap-2 pb-2 text-[10px] font-medium uppercase tracking-[0.24em] transition-colors duration-500",
                      active ? "text-ivory" : "text-platinum/70 hover:text-ivory",
                    )}
                  >
                    <span aria-hidden="true" className={cn("h-1 w-1 rotate-45 border border-platinum/60 transition-[background-color,transform] duration-500", active ? "border-ivory bg-ivory" : "group-hover:rotate-90 group-hover:bg-ivory/40")} />
                    <span className="relative grid overflow-hidden leading-none">
                      <span className="col-start-1 row-start-1 transition-transform duration-500 ease-[cubic-bezier(.19,1,.22,1)] group-hover:-translate-y-[120%]">{l.label}</span>
                      <span aria-hidden="true" className="col-start-1 row-start-1 translate-y-[120%] text-ivory transition-transform duration-500 ease-[cubic-bezier(.19,1,.22,1)] group-hover:translate-y-0">{l.label}</span>
                    </span>
                    <span aria-hidden="true" className={cn("absolute bottom-0 left-0 h-px bg-ivory transition-[width,opacity] duration-500", active ? "w-full opacity-90" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-60")} />
                  </a>
                </li>
              );
            })}
          </ul>
          <a href="#collection" data-kinetic-text className="group hidden items-center gap-3 border-l border-ivory/15 pl-5 md:flex">
            <span className="font-serif text-[15px] italic text-platinum/80 transition-colors duration-500 group-hover:text-ivory">Dress different.</span>
            <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center border border-ivory/30 text-[12px] transition-[background,color,transform] duration-500 group-hover:translate-x-0.5 group-hover:bg-ivory group-hover:text-ink">↗</span>
          </a>
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="relative z-[70] flex h-11 items-center gap-3 pl-3 text-[10px] font-medium uppercase tracking-[0.24em] md:hidden"
          >
            <span>{open ? "Close" : "Index"}</span>
            <span className="relative flex h-9 w-10 items-center justify-center border border-ivory/35 transition-[border-color,background-color] duration-500 hover:border-ivory/80 hover:bg-ivory/5">
              <span className={cn("absolute h-px w-5 bg-current transition-transform duration-500 ease-[cubic-bezier(.19,1,.22,1)]", open ? "rotate-45" : "-translate-y-[4px]")} />
              <span className={cn("absolute h-px w-5 bg-current transition-transform duration-500 ease-[cubic-bezier(.19,1,.22,1)]", open ? "-rotate-45" : "translate-y-[4px]")} />
              <span className={cn("absolute right-[7px] h-1 w-1 bg-current transition-transform duration-500", open ? "scale-0" : "scale-100")} />
            </span>
          </button>
        </nav>
      </header>

      <div
        ref={overlayRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
        inert={!open}
        style={{ visibility: "hidden", opacity: 0, backgroundImage: "radial-gradient(80% 65% at 90% 15%, rgba(180,182,188,.09), transparent 65%), linear-gradient(145deg, #101012, #080809 70%)" }}
        className="pt-safe pb-safe fixed inset-0 z-[65] flex flex-col bg-graphite text-ivory md:hidden"
      >
        <div className="flex flex-1 flex-col justify-center px-6 pt-20">
          <ul className="flex flex-col gap-2">
            {links.map((l, i) => (
              <li key={l.href} className="overflow-hidden">
                <a
                  data-menu-item
                  href={l.href}
                  onClick={() => close()}
                  className="font-display group flex items-baseline gap-4 py-1 text-[19vw] transition-transform duration-700 hover:translate-x-2 sm:text-[18vw]" data-kinetic-text
                >
                  <span aria-hidden="true" className="mr-1 inline-block w-8 border-t border-ivory/25 align-middle transition-[width,border-color] duration-500 group-hover:w-12 group-hover:border-ivory/80" />
                  {l.label}
                  <span aria-hidden="true" className="ml-auto text-[2rem] font-sans font-light leading-none text-platinum/55 transition-transform duration-500 group-hover:translate-x-2 group-hover:text-ivory">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div data-menu-foot className="flex items-end justify-between border-t border-ivory/15 px-6 py-6 text-[12px] uppercase tracking-[0.2em]">
          <div className="flex flex-col gap-2">
            <a href="#visit" onClick={() => close()} className="link-underline w-fit">
              Contact &amp; hours
            </a>
            {site.whatsapp ? (
              <a href={`https://wa.me/${site.whatsapp}`} className="link-underline w-fit" onClick={() => close()}>
                WhatsApp
              </a>
            ) : null}
          </div>
          <span className="text-platinum/60">{site.name}</span>
        </div>
      </div>
    </>
  );
}
