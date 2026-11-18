import { FaWhatsapp } from "react-icons/fa";
import { trackEvent } from "../../lib/analytics";
import useWebsiteContent from "../../hooks/useWebsiteContent";

export default function StickyMobileBar() {
  const { content } = useWebsiteContent();
  const number = (content.whatsapp || content.mobile).replace(/\D/g, "");
  return (
        <a
          href={`https://wa.me/${number}?text=Hello%20Yashmeen%20Fit-Out%2C%20I%20would%20like%20to%20enquire%20about%20a%20turnkey%20project.`}
          target="_blank"
          rel="noopener noreferrer"
          className="floating-whatsapp"
          aria-label="Chat on WhatsApp with Yashmeen Atelier"
          onClick={() => trackEvent("contact", { method: "whatsapp" })}
        >
          <FaWhatsapp size={28} aria-hidden="true" />
        </a>
  );
}
