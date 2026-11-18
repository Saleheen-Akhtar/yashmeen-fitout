import { Suspense, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Loading from "../components/ui/Loading";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import StickyMobileBar from "../components/layout/StickyMobileBar";
import CookieConsentBar from "../components/layout/CookieConsentBar";
import MotionProvider from "../motion/MotionProvider";

function RouteContent() {
  const ref = useRef(null);
  useEffect(() => {
    ref.current.dataset.motionReady = 'true';
  }, []);
  return <div ref={ref} className="route-content"><Outlet /></div>;
}

export default function Layout() {
  const { pathname } = useLocation();
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <MotionProvider />
      <Header />
      <main id="main" tabIndex={-1}>
        <Suspense key={pathname} fallback={<Loading />}>
          <RouteContent />
        </Suspense>
      </main>
      <Footer />
      <StickyMobileBar />
      <CookieConsentBar />
    </>
  );
}
