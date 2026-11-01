import { Link } from "react-router-dom";
import useWebDetails from "../hooks/cacheStore";

const ICONS = {
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21H18v-5.6c0-1.34-.02-3.05-1.86-3.05-1.87 0-2.16 1.46-2.16 2.96V21H10V9z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.6 7.2a2.5 2.5 0 00-1.76-1.77C18.28 5 12 5 12 5s-6.28 0-7.84.43A2.5 2.5 0 002.4 7.2C2 8.77 2 12 2 12s0 3.23.4 4.8a2.5 2.5 0 001.76 1.77C5.72 19 12 19 12 19s6.28 0 7.84-.43a2.5 2.5 0 001.76-1.77C22 15.23 22 12 22 12s0-3.23-.4-4.8zM10 15V9l5.2 3-5.2 3z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.7V3.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.4H7.7V13h2.7v8h3.1z" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.7 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.7 3zm-1.1 16.2h1.7L7.5 4.7H5.7l10.9 14.5z" />
    </svg>
  ),
  default: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
    </svg>
  ),
};

const CONTACT_ICONS = {
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.8 12 12 0 004.6 4c1.7.7 2.4.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.3z" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  ),
  location: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  ),
};

const getIcon = (platform = "") => {
  const key = platform.toLowerCase().trim();
  return ICONS[key] || ICONS.default;
};

export default function Footer() {
  const details = useWebDetails();

  const { address, email, mobile, whatsapp, socialLinks } = details || {};

  const a = address;
  let addressText = a
    ? [a.street, a.city, a.state, a.country].filter(Boolean).join(", ")
    : "Bay Square, Building 12 - Office G01, Business Bay, Dubai - UAE";
  if (!addressText || addressText.includes("Dubai , Dubai") || addressText.includes("Office0q")) {
    addressText = "Bay Square, Building 12 - Office G01, Business Bay, Dubai - UAE";
  }

  const waNumber = whatsapp ? whatsapp.replace(/[^\d]/g, "") : "";

  return (
    <>
      <style>{`
        /* ============ FOOTER ============ */
        footer {
            background: #100e0a;
            color: rgba(250, 247, 240, .75);
            padding: 76px 0 0;
        }

        .footer-grid {
            display: grid;
            grid-template-columns: 1.3fr 1fr 1fr 1fr;
            gap: 40px;
            padding-bottom: 56px;
            border-bottom: 1px solid rgba(250, 247, 240, .1);
        }

        .footer-brand .logo {
            color: var(--paper);
        }

        .footer-brand .logo img {
            width: 90px;
            padding: 10px;
            background: #fff;
            border-radius: 4px;
            display: block;
        }

        .footer-brand p {
            margin-top: 18px;
            font-size: 13.5px;
            line-height: 1.75;
            max-width: 34ch;
            color: rgba(250, 247, 240, .55);
        }

        .footer-social {
            display: flex;
            gap: 10px;
            margin-top: 22px;
        }

        .footer-social a {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 1px solid rgba(250, 247, 240, .2);
            color: var(--paper);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all .25s ease;
        }

        .footer-social a:hover {
            border-color: var(--brass);
            background: var(--brass);
            color: var(--ink);
            transform: translateY(-2px);
        }

        .footer-social svg {
            width: 16px;
            height: 16px;
        }

        .fcol h5 {
            font-size: 12px;
            letter-spacing: .12em;
            text-transform: uppercase;
            color: var(--brass-light);
            margin-bottom: 22px;
            font-weight: 700;
        }

        .fcol ul {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .fcol a {
            color: rgba(250, 247, 240, .7);
            font-size: 13.5px;
            transition: color .2s;
        }

        .fcol a:hover {
            color: var(--brass-light);
        }

        .contact-list li {
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }

        .contact-list .c-icon {
            flex-shrink: 0;
            width: 16px;
            height: 16px;
            margin-top: 3px;
            color: var(--brass);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .contact-list .c-icon svg {
            width: 100%;
            height: 100%;
        }

        .contact-list .c-text {
            color: rgba(250, 247, 240, .7);
            font-size: 13.5px;
            line-height: 1.5;
            overflow-wrap: anywhere;
            text-decoration: none;
            transition: color .2s;
        }

        .contact-list a.c-text:hover {
            color: var(--brass-light);
        }

        .footer-bottom {
            padding: 26px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12.5px;
            color: rgba(250, 247, 240, .45);
            flex-wrap: wrap;
            gap: 12px;
        }

        @media(max-width:900px) {
            .footer-grid {
                grid-template-columns: 1fr 1fr;
            }
        }

        @media(max-width:540px) {
            .footer-grid {
                grid-template-columns: 1fr;
            }
        }
      `}</style>

      <footer>
        <div className="wrap">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link to="/" className="logo" aria-label="Yashmeen Future Building">
                <img src="/static/logo.jpg" alt="Yashmeen Future Building" />
              </Link>
              <p>
                A Dubai-based interior fit-out and design studio delivering
                turnkey commercial, residential and hospitality spaces since
                2016.
              </p>

              {socialLinks?.length > 0 && (
                <div className="footer-social">
                  {socialLinks.map((item, i) => (
                    <a
                      key={item._id || `${item.platform}-${i}`}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.platform}
                      title={item.platform}
                    >
                      {getIcon(item.platform)}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="fcol">
              <h5>Studio</h5>
              <ul>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/quote">Get A Quote</Link></li>
                <li><Link to="/projects">Our Projects</Link></li>
                <li><Link to="/careers">Career</Link></li>
                <li><Link to="/blogs">Blogs</Link></li>
              </ul>
            </div>

            <div className="fcol">
              <h5>Services</h5>
              <ul>
                <li><Link to="/services/architecture">Architecture</Link></li>
                <li><Link to="/services/interior-design">Interior Design</Link></li>
                <li><Link to="/services/construction">Construction</Link></li>
                <li><Link to="/services/office-renovation">Office Renovation</Link></li>
                <li><Link to="/services/interior-design">Villa Fitout</Link></li>
              </ul>
            </div>

            <div className="fcol">
              <h5>Contact</h5>
              <ul className="contact-list">
                {mobile && (
                  <li>
                    <span className="c-icon" aria-hidden="true">{CONTACT_ICONS.phone}</span>
                    <a className="c-text" href={`tel:${mobile}`}>{mobile}</a>
                  </li>
                )}
                {waNumber && (
                  <li>
                    <span className="c-icon" aria-hidden="true">{CONTACT_ICONS.whatsapp}</span>
                    <a
                      className="c-text"
                      href={`https://wa.me/${waNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {whatsapp}
                    </a>
                  </li>
                )}
                {email && (
                  <li>
                    <span className="c-icon" aria-hidden="true">{CONTACT_ICONS.email}</span>
                    <a className="c-text" href={`mailto:${email}`}>{email}</a>
                  </li>
                )}
                {addressText && (
                  <li>
                    <span className="c-icon" aria-hidden="true">{CONTACT_ICONS.location}</span>
                    <span className="c-text">{addressText}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>&copy; {new Date().getFullYear()} Yashmeen Future Building. All rights reserved.</span>
            <span>Design &amp; concept &mdash; original build, not affiliated with any third party.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
