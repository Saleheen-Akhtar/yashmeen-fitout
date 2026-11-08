import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import "../../styles/admin-architectural.css";

const ROUTE_TITLES = {
  "/dashboard": "Atelier Overview",
  "/dashboard/quotes": "Quotations",
  "/dashboard/enquiry": "Client Inquiries",
  "/dashboard/project-manager": "Project Portfolio",
  "/dashboard/vacancy-manager": "Career Vacancies",
  "/dashboard/blog-manager": "Editorial & Insights",
  "/dashboard/create-blog": "Draft Insight",
  "/dashboard/gallery-manager": "Photo Atelier",
  "/dashboard/video-manager": "Cinematic Archive",
  "/dashboard/banner-manager": "Hero Banners",
  "/dashboard/popup-manager": "Announcement Popups",
  "/dashboard/categories": "Taxonomy & Categories",
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const currentPath = location.pathname.replace(/\/+$/, "") || "/dashboard";
  const activeMenu = ROUTE_TITLES[currentPath] || "Dashboard";
  const activeBreadcrumb = `Yashmeen Atelier / ${activeMenu}`;

  return (
    <div className="admin-shell-container" style={styles.container}>
      {sidebarOpen && (
        <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        activeMenu={activeMenu}
      />

      <main
        style={{
          ...styles.mainContent,
          ...(sidebarCollapsed && window.innerWidth > 768
            ? styles.mainContentCollapsed
            : {}),
        }}
      >
        <AdminHeader
          activeMenu={activeMenu}
          activeBreadcrumb={activeBreadcrumb}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <div style={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    background: "#f5f3ef",
    color: "#171613",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  overlay: {
    display: "block",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(17, 17, 16, 0.65)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    zIndex: 999,
  },
  mainContent: {
    marginLeft: window.innerWidth > 768 ? "280px" : 0,
    minHeight: "100vh",
    transition: "margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    background: "#f5f3ef",
  },
  mainContentCollapsed: {
    marginLeft: "80px",
  },
  content: {
    padding: window.innerWidth > 768 ? "32px 40px 60px 40px" : "20px 16px 40px 16px",
    maxWidth: "1400px",
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box",
  },
};
