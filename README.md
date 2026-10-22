# NOIR THREADS

A premium, animated fashion-showcase website for NOIR THREADS. Built with Next.js App Router, TypeScript, Tailwind CSS, GSAP + ScrollTrigger, and Three.js. Showcase only: no cart, checkout, order processing, or delivery flow.

## Run it

Requires Node.js 18.18+ (20+ recommended).

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run build      # production build
npm run start      # serve the production build
```

`next/font` loads Archivo and Bodoni Moda from Google Fonts during the first build, so build-time network access is required unless font caching is available.

## Edit shop details

Edit `lib/site.ts` to set the address, opening hours, WhatsApp number (digits with country code), Instagram, Facebook and email. Unset channels remain hidden; values beginning with `PLACEHOLDER` are clearly marked on the site and are not represented as confirmed business information.

## Photos and collection data

`public/images/` contains the supplied optimized WebP fashion photography. `lib/images.json` is the single source of truth for image titles, captions, categories and aspect ratios. The hero uses the supplied darker `hoodie-louvre` campaign image. Its NOIR / THREADS letterforms are real pointer-responsive particle typography, revealed in a staggered GSAP mask sequence and positioned apart from the model’s face and clothing. The collection filters and lightbox use the existing data. Pricing is intentionally omitted because no prices were provided.

## Motion and visual components

| Component | File | Purpose |
|---|---|---|
| Page-wide atmosphere | `components/atmosphere.tsx` | One restrained charcoal / graphite / silver WebGL light field behind all sections. The shader bends and brightens around the pointer; a second low-intensity reflected-light halo follows the pointer without blocking any controls. Uses the provided `AnimatedGradient` and its static fallback. |
| AnimatedGradient | `components/ui/animated-gradient.tsx` | Monochrome `Noir` shader preset; DPR cap, resize observer, off-screen and background-tab pause, reduced-motion freeze, WebGL context-loss fallback. |
| Hero sequence | `components/hero.tsx` | Coordinated GSAP image-mask and title reveals, supporting labels, CTA entry, scroll-linked image and title movement, and pointer-responsive depth on fine pointers. |
| Mobile / desktop navigation | `components/nav.tsx` | Editorial wordmark, scroll-aware header, active section indication, circular full-screen menu reveal, staggered link entrances, Escape handling, keyboard focus cycling, and scroll lock. |
| Liquid Glass Carousel | `components/ui/liquid-glass-carousel.tsx` + `components/gallery.tsx` | Restored the full supplied interactive WebGL lookbook carousel implementation, including its rise-and-grow entry choreography, drag / wheel momentum, active-frame focus and close sequence, liquid-glass lens, keyboard controls, local fashion photography, and an accessible snap-strip fallback. The lens shader now retains render-target alpha so the shared atmosphere remains visible beneath the animation. |
| CursorDrivenParticleTypography | `components/ui/particle-typography.tsx` + `components/brand.tsx` | Real canvas-particle typography shared by the hero and the major collection, lookbook, studio, visit, and footer headlines. Cursor/touch movement disperses points which spring back; particle counts are capped, off-screen animation pauses, reduced-motion users get static type, and semantic headings remain available to screen readers. |
| Collection | `components/showcase.tsx` | Existing category filters, editorial asymmetrical layout, supplied imagery, image light, hover reveals, click-to-view lightbox, Escape handling, and a coordinated GSAP re-entry when any filter changes. |
| Section reveals | `lib/use-reveals.ts` | ScrollTrigger clip reveals, opacity/position reveals, and subtle image parallax, skipped for reduced motion. |

The page uses one continuous animated, pointer-reactive background. Large display headlines share the particle typography system, while navigation links, labels, product captions, and controls use one restrained kinetic hover language. Sections retain tonal variations via restrained overlays rather than unrelated gradients or bright blocks. Existing section IDs, collection filtering, gallery controls, contact links, shop hours, and lightbox behavior remain in place. This remains a showcase-only clothing site; no cart, checkout, ordering, or delivery flow is included.

## Accessibility and performance notes

- The shader caps device pixel ratio and pauses when off-screen or when the browser tab is hidden. Browsers without WebGL2 receive a static monochrome fallback.
- Global section animations and the particle animation honor `prefers-reduced-motion`.
- The mobile menu supports Escape, keeps keyboard focus inside while open, restores focus to the menu trigger, and locks page scrolling while displayed.
- `lib/site.ts` contains placeholder shop details until replaced with confirmed information.

## Verification status

The supplied project was modified in place. A dependency install was attempted in the execution environment but could not reach `registry.npmjs.org` (DNS resolution failed); therefore `npm run typecheck`, `npm run build`, and browser-level desktop/mobile interaction tests could not be completed here. Run the commands above in a network-enabled environment to verify the production build. No claim is made that browser testing was completed.
