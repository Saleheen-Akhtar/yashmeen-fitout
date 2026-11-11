import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import useCreateStore from "../../store";
import { getInitials } from "../../libs/helpers";
import {
  FiSettings,
  FiBell,
  FiUser,
  FiExternalLink,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronDown,
} from "react-icons/fi";
import "../../styles/admin-architectural.css";

const PRIMARY_NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/dashboard/project-manager" },
  { label: "Quotes", href: "/dashboard/quotes" },
  { label: "Inquiries", href: "/dashboard/enquiry" },
  { label: "Gallery", href: "/dashboard/gallery-manager" },
  { label: "Journal", href: "/dashboard/blog-manager" },
  { label: "Categories", href: "/dashboard/categories" },
];

const STUDIO_NAV_LINKS = [
  { label: "Banners", href: "/dashboard/banner-manager" },
  { label: "Videos", href: "/dashboard/video-manager" },
  { label: "Vacancies", href: "/dashboard/vacancy-manager" },
  { label: "Popups", href: "/dashboard/popup-manager" },
];

const ALL_NAV_LINKS = [...PRIMARY_NAV_LINKS, ...STUDIO_NAV_LINKS];

export default function AdminLayout() {
  const [dubaiTime, setDubaiTime] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studioMenuOpen, setStudioMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useCreateStore();

  // Close menus on route transition
  const routeKey = `${location.pathname}${location.search}`;
  const [prevRouteKey, setPrevRouteKey] = useState(routeKey);
  if (prevRouteKey !== routeKey) {
    setPrevRouteKey(routeKey);
    if (mobileMenuOpen) setMobileMenuOpen(false);
    if (studioMenuOpen) setStudioMenuOpen(false);
  }

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const timeFormatter = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Dubai",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        setDubaiTime(timeFormatter.format(now));
      } catch {
        setDubaiTime("Dubai, UAE");
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close Studio dropdown on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setStudioMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isLinkActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    if (path === "/dashboard/blog-manager") {
      return (
        location.pathname.startsWith("/dashboard/blog-manager") ||
        location.pathname.startsWith("/dashboard/create-blog") ||
        location.pathname.startsWith("/dashboard/update-blog")
      );
    }
    return location.pathname.startsWith(path);
  };

  const isStudioRouteActive = STUDIO_NAV_LINKS.some((item) =>
    isLinkActive(item.href),
  );

  const openSiteSettingsModal = () => {
    setMobileMenuOpen(false);
    if (location.pathname !== "/dashboard") {
      navigate("/dashboard?open=site-settings");
    } else {
      window.dispatchEvent(new CustomEvent("open-cms-settings"));
    }
  };

  return (
    <div
      className="admin-shell-container"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Floating Architectural Bento Pill Header */}
      <header className="admin-header">
        <div className="admin-header-inner">
          {/* Left Oval Brand Pill */}
          <Link to="/dashboard" className="crex-brand-pill">
            <span>Yashmeen</span>
          </Link>

          {/* Center Frosted Pill Nav Bar */}
          <nav className="crex-nav-pillbar admin-desktop-nav" aria-label="Admin Navigation">
            {PRIMARY_NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`crex-nav-link ${isLinkActive(item.href) ? "is-active" : ""}`}
              >
                {item.label}
              </Link>
            ))}

            {/* Studio Sub-Modules Dropdown (Banners, Videos, Vacancies, Popups) */}
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setStudioMenuOpen((o) => !o)}
                className={`crex-nav-link ${isStudioRouteActive ? "is-active" : ""}`}
                aria-expanded={studioMenuOpen}
                aria-haspopup="menu"
              >
                <span>Media & HR</span>
                <FiChevronDown
                  size={13}
                  style={{
                    transform: studioMenuOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.18s ease",
                  }}
                />
              </button>

              {studioMenuOpen && (
                <div className="admin-dropdown-menu" role="menu">
                  {STUDIO_NAV_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setStudioMenuOpen(false)}
                      className={`admin-dropdown-item ${isLinkActive(item.href) ? "is-active" : ""}`}
                      role="menuitem"
                    >
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right Pill & Circle Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <button
              type="button"
              onClick={openSiteSettingsModal}
              className="crex-action-pill admin-hide-sm"
              title="Edit Website Settings, Hero, Contact & Services"
            >
              <FiSettings size={14} />
              <span>Setting</span>
            </button>

            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="crex-action-pill admin-hide-sm"
              title="Open Live Public Website"
            >
              <span>Live Site</span>
              <FiExternalLink size={13} />
            </Link>

            <button
              type="button"
              onClick={() => navigate("/dashboard/enquiry")}
              className="crex-icon-circle"
              title={`Inquiries · Dubai ${dubaiTime}`}
              aria-label="Inquiries Notifications"
              style={{ position: "relative" }}
            >
              <FiBell size={15} />
              <span
                style={{
                  position: "absolute",
                  top: "7px",
                  right: "8px",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--crex-brass)",
                }}
              />
            </button>

            <div
              className="crex-icon-circle admin-hide-sm"
              title={user?.name || "Admin Profile"}
              style={{ fontWeight: 700, fontSize: "11px" }}
            >
              {user?.name ? getInitials(user.name) : <FiUser size={15} />}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="crex-icon-circle admin-hide-sm"
              title="Sign out"
              aria-label="Sign out"
            >
              <FiLogOut size={14} />
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="crex-icon-circle admin-mobile-toggle"
              style={{ display: "none" }}
              aria-label="Toggle Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <FiX size={16} /> : <FiMenu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className="crex-card crex-animate-in"
            style={{
              marginTop: "10px",
              padding: "14px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              maxHeight: "calc(100vh - 88px)",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "6px",
              }}
            >
              {ALL_NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`crex-nav-link ${isLinkActive(item.href) ? "is-active" : ""}`}
                  style={{ justifyContent: "flex-start", padding: "9px 12px" }}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                paddingTop: "10px",
                marginTop: "6px",
                borderTop: "1px solid var(--crex-line)",
              }}
            >
              <button
                type="button"
                onClick={openSiteSettingsModal}
                className="crex-btn-ghost"
                style={{ flex: "1 1 120px", justifyContent: "center" }}
              >
                <FiSettings size={13} />
                <span>Site Settings</span>
              </button>
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                className="crex-btn-ghost"
                style={{ flex: "1 1 120px", justifyContent: "center", textDecoration: "none" }}
              >
                <span>Live Site</span>
                <FiExternalLink size={13} />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="crex-btn-dark"
                style={{ flex: "1 1 100%", justifyContent: "center" }}
              >
                <FiLogOut size={13} />
                <span>Sign Out ({user?.name || "Admin"})</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Page Body */}
      <main style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </main>

      {/* Soft Architectural Footer */}
      <footer
        style={{
          padding: "20px 28px 28px",
          fontSize: "12px",
          color: "var(--crex-muted)",
        }}
      >
        <div
          style={{
            maxWidth: "1440px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            borderTop: "1px solid var(--crex-line)",
            paddingTop: "16px",
          }}
        >
          <span>Yashmeen Future Building & Fit-Out · Live Website & CRM Studio</span>
          <span>Dubai GST {dubaiTime} · Connected to MongoDB</span>
        </div>
      </footer>
    </div>
  );
}
