import BeforeAfterSection from '../../components/Beforeafter';
import { useEffect, useRef } from "react";
import ClientsSection from "../../components/Clients";
import ContactSection from "../../components/ContactSection";
import BlogSection from "../../components/Blog";
import TestimonialsSection from "../../components/Testimonials";
import FactorySection from "../../components/Factory";
import OfferSection from "../../components/Offer";
import WhySection from "../../components/Why";
import CertificationsSection from "../../components/Certifications";
import ServicesSection from "../../components/Services";
import AboutSection from "../../components/About";
import HeroSection from "../../components/Hero";
import ProjectLanding from "../../components/ProjectLanding";
import { useState } from "react";
import { OfferModal } from "../../components/OfferModal";


export default function Home() {
  const [open, setOpen] = useState(true);
  
    const handleClose = () => {
      setOpen(false);
    };
  return (
    <>
    {open && <OfferModal handleClose={handleClose} />}
      <HeroSection />
      <ClientsSection />
      <AboutSection />
      <ServicesSection />
      <BeforeAfterSection />
      <CertificationsSection />
      <WhySection />
      <ProjectLanding />
      <OfferSection />
      <FactorySection />
      <TestimonialsSection />
      <BlogSection />
      <ContactSection />
    </>
  );
}
