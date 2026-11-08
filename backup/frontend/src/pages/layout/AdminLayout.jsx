import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import useCreateStore from "../../store";
import { getInitials } from "../../libs/helpers";
import { FiExternalLink, FiLogOut, FiMenu, FiX, FiCheck } from "react-icons/fi";
import "../../styles/shell.css";
import "../../styles/home.css";
import "../../styles/admin-architectural.css";

const NAV_LINKS = [
  { label: "Pipeline", href: "/dashboard" },
  { label: "Commissions", href: "/dashboard/quotes" },
  { label: "Inquiries", href: "/dashboard/enquiry" },
  { label: "Projects", href: "/dashboard/project-manager" },
  { label: "Journal", href: "/dashboard/blog-manager" },
  { label: "Gallery", href: "/dashboard/gallery-manager" },
  { label: "Video", href: "/dashboard/video-manager" },
  { label: "Categories", href: "/dashboard/categories" },
];

export default function AdminLayout() {
  const [dubaiTime, setDubaiTime] = useState("");
  const [isOpenOffice, setIsOpenOffice] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
        const hourFormatter = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Dubai",
          hour: "numeric",
          hour12: false,
        });
        const dayFormatter = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Dubai",
          weekday: "short",
        });

        const timeStr = timeFormatter.format(now);
        const hourNum = parseInt(hourFormatter.format(now), 10);
        const dayStr = dayFormatter.format(now);

        const open = dayStr !== "Sun" && hourNum >= 8 && hourNum < 18;
        setDubaiTime(timeStr);
        setIsOpenOffice(open);
      } catch {
        setDubaiTime("Dubai, UAE");
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  return (
    <div
      style={{
        background: "var(--bg, #fcfcfc)",
        color: "var(--ink, #080807)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-sans, 'Plus Jakarta Sans', sans-serif)",
      }}
    >
      {/* ====================================================================
          TOP LUXURY EDITORIAL HEADER (Exact Website Vibe)
          ==================================================================== */}
      <header
        style={{
          position: "sticky",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 120,
          height: "78px",
          display: "flex",
          alignItems: "center",
          background: scrolled
            ? "rgba(252, 252, 252, 0.96)"
            : "rgba(252, 252, 252, 0.90)",
          backdropFilter: "saturate(160%) blur(16px)",
          WebkitBackdropFilter: "saturate(160%) blur(16px)",
          borderBottom: "1px solid var(--line, rgba(8, 8, 7, 0.12))",
          transition: "background 0.3s ease, box-shadow 0.3s ease",
          boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.04)" : "none",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "var(--max-width, 1440px)",
            margin: "0 auto",
            padding: "0 var(--site-margin, clamp(1.5rem, 4vw, 4rem))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxSizing: "border-box",
          }}
        >
          {/* Brand Left */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)",
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "var(--ink, #080807)",
                textTransform: "uppercase",
              }}
            >
              YASHMEEN FIT-OUT
            </span>
            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "var(--muted, #545454)",
                borderLeft: "1px solid var(--line-strong, rgba(8, 8, 7, 0.22))",
                paddingLeft: "8px",
                textTransform: "uppercase",
              }}
            >
              ATELIER CMS
            </span>
          </Link>

          {/* Center Links with comma separation (Desktop) */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            className="admin-desktop-nav"
          >
            {NAV_LINKS.map((item, idx) => {
              const active = isLinkActive(item.href);
              return (
                <span
                  key={item.href}
                  style={{ display: "inline-flex", alignItems: "center" }}
                >
                  <Link
                    to={item.href}
                    style={{
                      fontSize: "13px",
                      fontWeight: active ? 700 : 500,
                      letterSpacing: "0.02em",
                      textTransform: "capitalize",
                      color: active ? "var(--ink, #080807)" : "var(--muted, #545454)",
                      textDecoration: "none",
                      padding: "6px 4px",
                      transition: "color 0.2s ease",
                      borderBottom: active
                        ? "1.5px solid var(--ink, #080807)"
                        : "1.5px solid transparent",
                    }}
                  >
                    {item.label}
                  </Link>
                  {idx < NAV_LINKS.length - 1 && (
                    <span
                      style={{
                        color: "var(--line-strong, rgba(8, 8, 7, 0.22))",
                        margin: "0 4px",
                        fontSize: "12px",
                      }}
                    >
                      ,
                    </span>
                  )}
                </span>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* Live Dubai Time Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "var(--radius-pill, 9999px)",
                border: "1px solid var(--line, rgba(8, 8, 7, 0.12))",
                background: "var(--surface, #ffffff)",
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--muted, #545454)",
                letterSpacing: "0.04em",
              }}
              className="admin-telemetry-pill"
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: isOpenOffice ? "var(--ink, #080807)" : "#888888",
                  display: "inline-block",
                }}
              />
              <span>DUBAI {dubaiTime} GST</span>
            </div>

            {/* View Site Action */}
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "11.5px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                textDecoration: "none",
                color: "var(--ink, #080807)",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
              className="admin-view-site-link"
            >
              <span>SITE</span>
              <FiExternalLink size={11} />
            </Link>

            {/* Sign Out Action */}
            <button
              type="button"
              onClick={handleLogout}
              style={{
                background: "transparent",
                border: "1px solid var(--line-strong, rgba(8, 8, 7, 0.22))",
                borderRadius: "var(--radius-pill, 9999px)",
                padding: "6px 16px",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--ink, #080807)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--ink, #080807)";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.borderColor = "var(--ink, #080807)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--ink, #080807)";
                e.currentTarget.style.borderColor = "var(--line-strong, rgba(8, 8, 7, 0.22))";
              }}
            >
              <FiLogOut size={12} />
              <span>LOGOUT</span>
            </button>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--ink, #080807)",
                display: "none",
              }}
              className="admin-mobile-menu-btn"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              position: "fixed",
              top: "78px",
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(252, 252, 252, 0.98)",
              backdropFilter: "blur(20px)",
              zIndex: 110,
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: "18px",
                  fontWeight: isLinkActive(item.href) ? 800 : 500,
                  color: "var(--ink, #080807)",
                  textDecoration: "none",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--line, rgba(8, 8, 7, 0.12))",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* ====================================================================
          MAIN EDITORIAL WORKSPACE (Wrapped in .wrap for identical margins)
          ==================================================================== */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* ====================================================================
          MINIMALIST QUIET LUXURY FOOTER (Exact Website Vibe)
          ==================================================================== */}
      <footer
        style={{
          borderTop: "1px solid var(--line, rgba(8, 8, 7, 0.12))",
          padding: "clamp(3rem, 6vw, 5rem) 0",
          background: "var(--bg, #fcfcfc)",
        }}
      >
        <div
          className="wrap"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              YASHMEEN FUTURE BUILDING & FIT-OUT
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "var(--muted, #545454)",
                marginTop: "4px",
              }}
            >
              Al Quoz 4, Dubai, UAE · 35,000 Sq. Ft. Joinery & MEP Atelier
            </div>
          </div>

          <div
            style={{
              fontSize: "11px",
              color: "var(--muted-light, #8a8a86)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            © {new Date().getFullYear()} YASHMEEN · ATELIER CMS CONTROL
          </div>
        </div>
      </footer>
    </div>
  );
}
