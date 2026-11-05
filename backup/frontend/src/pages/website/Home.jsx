import "../../styles/home.css";
import Preloader from "../../components/home/Preloader";
import Hero from "../../components/home/Hero";
import Studio from "../../components/home/Studio";
import Works from "../../components/home/Works";
import Process from "../../components/home/Process";
import Testimonial from "../../components/home/Testimonial";
import CTA from "../../components/home/CTA";

export default function Home() {
  return (
    <>
      <Preloader />
      <main>
        <Hero />
        <Studio />
        <Works />
        <Process />
        <Testimonial />
        <CTA />
      </main>
    </>
  );
}
