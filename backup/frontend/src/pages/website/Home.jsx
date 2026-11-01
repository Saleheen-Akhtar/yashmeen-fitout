import { useState } from "react";
import HeroSection from "../../components/Hero";
import ClientsSection from "../../components/Clients";
import DisciplinesSection from "../../components/Disciplines";
import ShowcaseSection from "../../components/Showcase";
import MethodologySection from "../../components/Methodology";
import ScopeConfigurator from "../../components/ScopeConfigurator";
import TestimonialsSection from "../../components/Testimonials";
import ContactSection from "../../components/ContactSection";
import { OfferModal } from "../../components/OfferModal";

export default function Home() {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <main className="overflow-x-hidden w-full max-w-full">
      {open && <OfferModal handleClose={handleClose} />}
      <HeroSection />
      <ClientsSection />
      <DisciplinesSection />
      <ShowcaseSection />
      <MethodologySection />
      <ScopeConfigurator />
      <TestimonialsSection />
      <ContactSection />
    </main>
  );
}
