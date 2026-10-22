import { site } from "@/lib/site";
import { CursorDrivenParticleTypography } from "@/components/ui/particle-typography";

const nav = [
  { href: "#collection", label: "Collection" },
  { href: "#lookbook", label: "Lookbook" },
  { href: "#about", label: "Studio" },
  { href: "#visit", label: "Visit" },
];

export function Footer() {
  const socials = [
    site.instagram && { label: "Instagram", href: site.instagram },
    site.facebook && { label: "Facebook", href: site.facebook },
    site.whatsapp && { label: "WhatsApp", href: `https://wa.me/${site.whatsapp.replace(/\D/g, "")}` },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className="pb-safe overflow-hidden border-t border-ivory/15 bg-ink/35 px-5 pt-16 text-ivory md:px-10">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-10 md:flex-row md:justify-between">
        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3 text-[12px] font-medium uppercase tracking-[0.22em]">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="link-underline pb-1">
              {n.label}
            </a>
          ))}
        </nav>
        <ul className="flex flex-wrap gap-x-8 gap-y-3 text-[12px] font-medium uppercase tracking-[0.22em]">
          {socials.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="link-underline pb-1">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="sr-only">{site.name}</p>
      <div aria-hidden="true" className="-mb-[0.08em] mt-14 h-[20vw] min-h-[115px] w-full select-none text-center text-ivory">
        <CursorDrivenParticleTypography text="NOIR THREADS" fontSize={330} particleDensity={8} particleSize={1.3} dispersionStrength={13} returnSpeed={0.08} maxParticles={2600} />
      </div>
      <div className="flex justify-between border-t border-ivory/15 py-5 text-[11px] uppercase tracking-[0.2em] text-platinum/75">
        <span>&copy; {new Date().getFullYear()} {site.name}</span>
        <a href="#top" className="link-underline">Back to top ↑</a>
      </div>
    </footer>
  );
}
