import { Atmosphere } from "@/components/atmosphere";
import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { Showcase } from "@/components/showcase";
import { Gallery } from "@/components/gallery";
import { Brand } from "@/components/brand";
import { Visit } from "@/components/visit";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Atmosphere />
      <div className="relative z-10">
        <Nav />
        <main>
          <Hero />
          <Marquee />
          <Showcase />
          <Gallery />
          <Brand />
          <Visit />
        </main>
        <Footer />
      </div>
    </>
  );
}
