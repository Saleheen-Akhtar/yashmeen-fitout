import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import AdminHeader from "../../components/admin/AdminHeader";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  const [activeBreadcrumb, setActiveBreadcrumb] = useState("Home / Dashboard");

  const handleMenuClick = (menuName, parentName = null) => {
    setActiveMenu(menuName);
    if (parentName) {
      setActiveBreadcrumb(`Home / ${parentName} / ${menuName}`);
    } else {
      setActiveBreadcrumb(`Home / ${menuName}`);
    }
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };
  return (
    <div style={styles.container}>
      {sidebarOpen && (
        <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        handleMenuClick={handleMenuClick}
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
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "#f8f9fa",
    color: "#2c3e50",
    minHeight: "100vh",
  },
  overlay: {
    display: "block",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
  },

  mainContent: {
    marginLeft: window.innerWidth > 768 ? "280px" : 0,
    minHeight: "100vh",
    transition: "margin-left 0.3s ease",
  },
  mainContentCollapsed: {
    marginLeft: "80px",
  },

  content: {
    padding: window.innerWidth > 768 ? "30px" : "20px 15px",
  },
};
