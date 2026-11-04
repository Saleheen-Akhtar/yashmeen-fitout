import HeroSection from "../../components/Hero";
import Marquee from "../../components/Marquee";
import IntroSection from "../../components/Intro";
import DisciplinesSection from "../../components/Disciplines";
import ShowcaseSection from "../../components/Showcase";
import Numbers from "../../components/Numbers";
import MethodologySection from "../../components/Methodology";
import TestimonialsSection from "../../components/Testimonials";
import ContactSection from "../../components/ContactSection";

export default function Home() {
  return (
    <main data-manual>
      <HeroSection />
      <Marquee />
      <IntroSection />
      <DisciplinesSection />
      <ShowcaseSection />
      <Numbers />
      <MethodologySection />
      <TestimonialsSection />
      <ContactSection />
    </main>
  );
}
