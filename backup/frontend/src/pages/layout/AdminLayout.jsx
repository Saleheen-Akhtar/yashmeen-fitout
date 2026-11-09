import React, { useState, useEffect } from "react";
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
} from "react-icons/fi";
import "../../styles/admin-architectural.css";

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/dashboard/project-manager" },
  { label: "Quotes", href: "/dashboard/quotes" },
  { label: "Inquiries", href: "/dashboard/enquiry" },
  { label: "Gallery", href: "/dashboard/gallery-manager" },
  { label: "Journal", href: "/dashboard/blog-manager" },
  { label: "Categories", href: "/dashboard/categories" },
];

export default function AdminLayout() {
  const [dubaiTime, setDubaiTime] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useCreateStore();

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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isLinkActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  const openSiteSettingsModal = () => {
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
      {/* Top Floating Crextio-Style Pill Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          padding: "16px 28px 10px",
          background: "linear-gradient(180deg, rgba(244,244,240,0.86) 0%, rgba(244,244,240,0) 100%)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1440px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          {/* Left Oval Brand Pill */}
          <Link to="/dashboard" className="crex-brand-pill">
            <span>Yashmeen</span>
          </Link>

          {/* Center Frosted Pill Nav Bar */}
          <nav className="crex-nav-pillbar admin-desktop-nav" aria-label="Admin Navigation">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`crex-nav-link ${isLinkActive(item.href) ? "is-active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Pill & Circle Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              onClick={openSiteSettingsModal}
              className="crex-action-pill"
              title="Edit Website Settings, Hero, Contact & Services"
            >
              <FiSettings size={14} />
              <span>Setting</span>
            </button>

            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="crex-action-pill"
              title="Open Live Public Website"
            >
              <span>Live Site</span>
              <FiExternalLink size={13} />
            </Link>

            <button
              type="button"
              onClick={() => navigate("/dashboard/enquiry")}
              className="crex-icon-circle"
              title={`Notifications · Dubai ${dubaiTime}`}
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
                  background: "#f5cb5c",
                }}
              />
            </button>

            <div
              className="crex-icon-circle"
              title={user?.name || "Admin Profile"}
              style={{ fontWeight: 700, fontSize: "11px" }}
            >
              {user?.name ? getInitials(user.name) : <FiUser size={15} />}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="crex-icon-circle"
              title="Sign out"
            >
              <FiLogOut size={14} />
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="crex-icon-circle admin-mobile-toggle"
              style={{ display: "none" }}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <FiX size={16} /> : <FiMenu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div
            className="crex-card"
            style={{
              marginTop: "12px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`crex-nav-link ${isLinkActive(item.href) ? "is-active" : ""}`}
                style={{ display: "block" }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Page Body */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Soft Minimal Footer */}
      <footer
        style={{
          padding: "20px 28px 28px",
          fontSize: "12px",
          color: "#71717a",
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
            borderTop: "1px solid rgba(0, 0, 0, 0.06)",
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
