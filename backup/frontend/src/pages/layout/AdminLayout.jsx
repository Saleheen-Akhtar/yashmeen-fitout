import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import useCreateStore from "../../store";
import { getInitials } from "../../libs/helpers";
import { FiExternalLink, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import "../../styles/admin-architectural.css";

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Quotations", href: "/dashboard/quotes" },
  { label: "Inquiries", href: "/dashboard/enquiry" },
  { label: "Projects", href: "/dashboard/project-manager" },
  { label: "Journal", href: "/dashboard/blog-manager" },
  { label: "Gallery", href: "/dashboard/gallery-manager" },
  { label: "Categories", href: "/dashboard/categories" },
];

export default function AdminLayout() {
  const [dubaiTime, setDubaiTime] = useState("");
  const [isOpenOffice, setIsOpenOffice] = useState(false);
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
      className="admin-shell-container"
      style={{
        background: "#f8f9fa",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        color: "#1e2022",
      }}
    >
      {/* Top Calming Navigation Bar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          height: "68px",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1480px",
            margin: "0 auto",
            padding: "0 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxSizing: "border-box",
          }}
        >
          {/* Brand Left */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              to="/dashboard"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  letterSpacing: "-0.01em",
                  color: "#18181b",
                }}
              >
                YASHMEEN
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#6b7280",
                  background: "#f3f4f6",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  letterSpacing: "0.02em",
                }}
              >
                CRM
              </span>
            </Link>
          </div>

          {/* Center Links */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
            className="admin-desktop-nav"
          >
            {NAV_LINKS.map((item) => {
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  style={{
                    fontSize: "13px",
                    fontWeight: active ? 600 : 500,
                    color: active ? "#18181b" : "#6b7280",
                    background: active ? "#f3f4f6" : "transparent",
                    textDecoration: "none",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.color = "#18181b";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.color = "#6b7280";
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* Live Dubai Status Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                padding: "4px 12px",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: 500,
                color: "#4b5563",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: isOpenOffice ? "#10b981" : "#9ca3af",
                  display: "inline-block",
                }}
              />
              <span>Dubai {dubaiTime}</span>
            </div>

            {/* View Public Site */}
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "#6b7280",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>Site</span>
              <FiExternalLink size={12} />
            </Link>

            {/* User Avatar + Sign out */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "#e5e7eb",
                  color: "#374151",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                {getInitials(user?.name || "Admin")}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#6b7280",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 8px",
                  borderRadius: "6px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
              >
                <FiLogOut size={13} />
                <span>Sign out</span>
              </button>
            </div>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#18181b",
                display: "none",
              }}
              className="admin-mobile-menu-btn"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              position: "fixed",
              top: "68px",
              left: 0,
              right: 0,
              bottom: 0,
              background: "#ffffff",
              zIndex: 110,
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: "15px",
                  fontWeight: isLinkActive(item.href) ? 600 : 500,
                  color: "#18181b",
                  textDecoration: "none",
                  padding: "10px 0",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Main Container */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Subtle Tranquil Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(0, 0, 0, 0.05)",
          padding: "24px 0",
          background: "#ffffff",
          color: "#9ca3af",
          fontSize: "12px",
        }}
      >
        <div
          style={{
            maxWidth: "1480px",
            margin: "0 auto",
            padding: "0 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>Yashmeen Future Building & Fit-Out · Atelier CRM Console</div>
          <div>Al Quoz Industrial Area 4, Dubai, UAE</div>
        </div>
      </footer>
    </div>
  );
}
