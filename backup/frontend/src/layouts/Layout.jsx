import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import StickyMobileBar from "../components/layout/StickyMobileBar";
import CookieConsentBar from "../components/layout/CookieConsentBar";
import MotionProvider from "../motion/MotionProvider";

export default function Layout() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <MotionProvider />
      <Header />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <StickyMobileBar />
      <CookieConsentBar />
    </>
  );
}
