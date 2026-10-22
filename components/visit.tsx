"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { useReveals } from "@/lib/use-reveals";
import { CursorDrivenParticleTypography } from "@/components/ui/particle-typography";

const isPlaceholder = (v: string) => v === "" || v.startsWith("PLACEHOLDER");

type Channel = { label: string; href: string };

function channels(): Channel[] {
  const out: Channel[] = [];
  if (site.whatsapp) out.push({ label: "WhatsApp", href: `https://wa.me/${site.whatsapp.replace(/\D/g, "")}` });
  if (site.instagram) out.push({ label: "Instagram", href: site.instagram });
  if (site.facebook) out.push({ label: "Facebook", href: site.facebook });
  if (site.email) out.push({ label: "Email", href: `mailto:${site.email}` });
  return out;
}

export function Visit() {
  const root = useRef<HTMLElement>(null);
  useReveals(root);
  const list = channels();
  // Resolved on the client only, so server and client markup match during hydration.
  const [today, setToday] = useState("");
  useEffect(() => setToday(new Date().toLocaleDateString("en-US", { weekday: "long" })), []);

  return (
    <section ref={root} id="visit" className="relative overflow-hidden bg-transparent px-5 py-28 md:px-10 md:py-40">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(65%_90%_at_10%_55%,rgba(185,185,190,.05),transparent_68%)]" />
      <div className="relative mx-auto max-w-[1800px]">
        <p data-reveal="up" className="mb-6 text-[12px] font-medium uppercase tracking-[0.3em] text-platinum">
          04 / Visit
        </p>
        <div data-reveal="up" data-kinetic-text className="max-w-[94vw]">
          <h2 className="sr-only">Come in</h2>
          <div aria-hidden="true" className="h-[28vw] min-h-[135px] w-full text-ivory md:h-[15vw] md:min-h-[180px]">
            <CursorDrivenParticleTypography text="COME IN" fontSize={250} particleDensity={8} particleSize={1.35} dispersionStrength={16} returnSpeed={0.075} maxParticles={2200} />
          </div>
        </div>

        <div className="mt-16 grid gap-16 md:mt-24 md:grid-cols-12">
          <div data-reveal="up" className="md:col-span-5">
            <h3 className="mb-4 text-[12px] font-medium uppercase tracking-[0.3em] text-platinum">The shop</h3>
            <address className={`not-italic text-2xl leading-snug md:text-3xl ${isPlaceholder(site.address) ? "text-platinum/60" : ""}`}>
              {site.address}
            </address>
            {isPlaceholder(site.address) && (
              <p className="mt-3 text-xs text-platinum/50">Placeholder. Set the real address in lib/site.ts.</p>
            )}

            <h3 className="mb-4 mt-14 text-[12px] font-medium uppercase tracking-[0.3em] text-platinum">Get in touch</h3>
            {list.length > 0 ? (
              <ul className="flex flex-wrap gap-3">
                {list.map((c) => (
                  <li key={c.label}>
                    <a
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="inline-block border border-ivory/50 px-5 py-3 text-[12px] font-medium uppercase tracking-[0.22em] transition-colors hover:bg-ivory hover:text-ink"
                    >
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-platinum/60">
                Contact channels are not configured yet. Add WhatsApp, Instagram, Facebook or email in lib/site.ts.
              </p>
            )}
          </div>

          <div data-reveal="up" className="md:col-span-6 md:col-start-7">
            <h3 className="mb-4 text-[12px] font-medium uppercase tracking-[0.3em] text-platinum">Opening hours</h3>
            <dl className="divide-y divide-ivory/15 border-y border-ivory/15">
              {site.hours.map((h) => {
                const isToday = h.day === today;
                return (
                  <div key={h.day} className={`flex items-baseline justify-between py-4 ${isToday ? "text-ivory" : "text-platinum"}`}>
                    <dt className="font-display text-3xl md:text-4xl">
                      {h.day}
                      {isToday && <span className="ml-3 align-middle font-sans text-[10px] font-medium tracking-[0.2em]">TODAY</span>}
                    </dt>
                    <dd className={`text-sm md:text-base ${isPlaceholder(h.open) ? "text-platinum/50" : ""}`}>{h.open}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
