import { Phone, MessageCircle, ArrowUpRight } from "lucide-react";

export default function StickyMobileBar() {
  const openEnquiry = () => {
    window.dispatchEvent(new CustomEvent("open-questionnaire"));
  };

  return (
    <aside
      className="sticky-mobile-bar"
      aria-label="Quick contact and consultation actions"
    >
      <div className="sticky-mobile-bar-inner">
        <a
          href="tel:+971543862870"
          className="sticky-mobile-btn sticky-mobile-call"
          aria-label="Call Yashmeen Atelier at +971 54 386 2870"
        >
          <Phone size={15} aria-hidden="true" />
          <span>Call</span>
        </a>

        <a
          href="https://wa.me/971543862870?text=Hello%20Yashmeen%20Fit-Out%2C%20I%20would%20like%20to%20enquire%20about%20a%20turnkey%20project."
          target="_blank"
          rel="noopener noreferrer"
          className="sticky-mobile-btn sticky-mobile-whatsapp"
          aria-label="Chat on WhatsApp with Yashmeen Atelier"
        >
          <MessageCircle size={15} aria-hidden="true" />
          <span>WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={openEnquiry}
          className="sticky-mobile-btn sticky-mobile-enquire"
          aria-label="Open Project Enquiry Questionnaire"
        >
          <span>Enquire</span>
          <ArrowUpRight size={14} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
