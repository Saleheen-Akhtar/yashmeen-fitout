import { useEffect } from "react";
import "../../styles/home.css";
import Hero from "../../components/home/Hero";
import Studio from "../../components/home/Studio";
import Works from "../../components/home/Works";
import Process from "../../components/home/Process";
import Testimonial from "../../components/home/Testimonial";
import CTA from "../../components/home/CTA";

export default function Home() {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div className="home-page">
      <Hero />
      <Studio />
      <Works />
      <Process />
      <Testimonial />
      <CTA />
    </div>
  );
}
