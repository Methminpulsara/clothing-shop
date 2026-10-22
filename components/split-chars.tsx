import { cn } from "@/lib/utils";

/** Splits text into masked characters (.hero-char) for staggered GSAP reveals. Accessible via aria-label. */
export function SplitChars({ text, className }: { text: string; className?: string }) {
  return (
    <span aria-label={text} className={cn("inline-block", className)}>
      {Array.from(text).map((c, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden align-bottom">
          <span className="hero-char inline-block will-change-transform">{c === " " ? "\u00A0" : c}</span>
        </span>
      ))}
    </span>
  );
}
