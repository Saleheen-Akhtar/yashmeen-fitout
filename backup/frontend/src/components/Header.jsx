import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useWebDetails from "../hooks/cacheStore";
import QuestionnaireModal from "./layout/QuestionnaireModal";
import "../styles/shell.css";

const NAV_ITEMS = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about", children: [["About Us", "/about"], ["Founders Message", "/founders-message"], ["Why Us", "/why-us"], ["FAQ", "/faq"], ["Careers", "/careers"]] },
  { label: "Services", path: "/services", children: [["Architecture", "/services/architecture"], ["Interior Design", "/services/interior-design"], ["Construction", "/services/construction"], ["Office Renovation", "/services/office-renovation"]] },
  { label: "Gallery", path: "/gallery", children: [["Photo Gallery", "/photo-gallery"], ["Video Gallery", "/video-gallery"]] },
  { label: "Projects", path: "/projects" },
  { label: "Contact", path: "/contact" },
];

function Chevron({ open }) {
  return <span className={`original-nav-chevron${open ? " is-open" : ""}`} aria-hidden="true">⌄</span>;
}

export default function Header() {
  const details = useWebDetails();
  const { pathname } = useLocation();
  const [mobile, setMobile] = useState(false);
  const [open, setOpen] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const phone = details?.mobile || "+971 54 386 2870";

  useEffect(() => {
    const sync = () => setMobile(window.innerWidth <= 980);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setOpen(null);
  }, [pathname]);

  const closeMobile = () => { setMenuOpen(false); setOpen(null); };

  return <>
    <header className="original-nav" aria-label="Primary navigation">
      <div className="original-nav-inner">
        <Link to="/" className="original-nav-logo" aria-label="Yashmeen Future Building home"><img src="/static/logo.jpg" alt="Yashmeen Future Building" /></Link>
        {!mobile && <nav className="original-nav-links">
          {NAV_ITEMS.map((item) => <div className="original-nav-item" key={item.label} onMouseEnter={() => item.children && setOpen(item.label)} onMouseLeave={() => item.children && setOpen(null)}>
            <div className="original-nav-link-row"><Link to={item.path} className={pathname === item.path ? "is-active" : ""}>{item.label}</Link>{item.children && <button type="button" aria-label={`Toggle ${item.label} menu`} aria-expanded={open === item.label} onClick={() => setOpen(open === item.label ? null : item.label)}><Chevron open={open === item.label} /></button>}</div>
            {item.children && open === item.label && <div className="original-nav-dropdown">{item.children.map(([label, path]) => <Link key={path} to={path}>{label}</Link>)}</div>}
          </div>)}
        </nav>}
        <div className="original-nav-actions">
          {!mobile && <a className="original-nav-phone" href={`tel:${phone.replace(/\s+/g, "")}`}><small>Call the Studio</small><span>{phone}</span></a>}
          <button type="button" className="original-nav-quote" onClick={() => setEnquiryOpen(true)}>Get a Quote</button>
          {mobile && <button type="button" className={`original-nav-menu${menuOpen ? " is-open" : ""}`} onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"}><i /><i /><i /></button>}
        </div>
      </div>
      {mobile && menuOpen && <nav className="original-nav-mobile" aria-label="Mobile navigation">
        {NAV_ITEMS.map((item) => <div key={item.label}><div className="original-nav-mobile-row"><Link to={item.path} onClick={closeMobile}>{item.label}</Link>{item.children && <button type="button" onClick={() => setOpen(open === item.label ? null : item.label)}><Chevron open={open === item.label} /></button>}</div>{item.children && open === item.label && <div className="original-nav-mobile-children">{item.children.map(([label, path]) => <Link key={path} to={path} onClick={closeMobile}>{label}</Link>)}</div>}</div>)}
        <a className="original-nav-mobile-phone" href={`tel:${phone.replace(/\s+/g, "")}`}><small>Call the Studio</small><span>{phone}</span></a>
        <button type="button" className="original-nav-mobile-quote" onClick={() => { closeMobile(); setEnquiryOpen(true); }}>Get a Quote</button>
      </nav>}
    </header>
    <QuestionnaireModal isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} />
  </>;
}
