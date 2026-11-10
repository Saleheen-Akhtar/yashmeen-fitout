import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useCreateStore from "../../store";

import { FaRegBuilding } from "react-icons/fa";
import { FaPhotoVideo } from "react-icons/fa";
import { FaList } from "react-icons/fa";
import { GiJumpAcross } from "react-icons/gi";
import { AiOutlineDashboard } from "react-icons/ai";
import { GrNotes } from "react-icons/gr";
import { MdOndemandVideo } from "react-icons/md";
import { IoMdChatbubbles } from "react-icons/io";
import { MdOutlineEmail } from "react-icons/md";
import { BsChatLeftQuote } from "react-icons/bs";
import { FiExternalLink, FiChevronRight } from "react-icons/fi";

const menuItems = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: <AiOutlineDashboard />,
    link: "/dashboard",
    role: "admin",
  },
  {
    id: "quotes",
    name: "Quotes",
    icon: <BsChatLeftQuote />,
    link: "/dashboard/quotes",
    role: "admin",
  },
  {
    id: "enquiry",
    name: "Enquiry",
    icon: <MdOutlineEmail />,
    link: "/dashboard/enquiry",
    role: "admin",
  },
  {
    id: "projects",
    name: "Projects",
    icon: <FaRegBuilding />,
    link: "/dashboard/project-manager",
    role: "admin",
  },
  {
    id: "vacancies",
    name: "Vacancies",
    icon: <GiJumpAcross />,
    link: "/dashboard/vacancy-manager",
    role: "admin",
  },
  {
    id: "blogs",
    name: "Blogs",
    icon: <GrNotes />,
    link: "/dashboard/blog-manager",
    role: "admin",
  },
  {
    id: "photo-gallery",
    name: "Photo Gallery",
    icon: <FaPhotoVideo />,
    link: "/dashboard/gallery-manager",
    role: "admin",
  },
  {
    id: "video-gallery",
    name: "Video Gallery",
    icon: <MdOndemandVideo />,
    link: "/dashboard/video-manager",
    role: "admin",
  },
  {
    id: "popup",
    name: "Popup",
    icon: <IoMdChatbubbles />,
    link: "/dashboard/popup-manager",
    role: "admin",
  },
  {
    id: "category",
    name: "Categories",
    icon: <FaList />,
    link: "/dashboard/categories",
    role: "admin",
  },
];

const Sidebar = ({
  sidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  handleMenuClick,
}) => {
  const [openSubmenus, setOpenSubmenus] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useCreateStore();

  const isLinkActive = (link) => {
    if (link === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(link);
  };

  const toggleSubmenu = (menuId) => {
    setOpenSubmenus((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        if (key !== menuId) newState[key] = false;
      });
      newState[menuId] = !prev[menuId];
      return newState;
    });
  };

  return (
    <aside
      style={{
        ...styles.sidebar,
        ...(sidebarOpen ? styles.sidebarActive : {}),
        ...(sidebarCollapsed ? styles.sidebarCollapsed : {}),
      }}
    >
      {/* Brand Header */}
      <div style={styles.sidebarHeader}>
        <div style={styles.sidebarHeaderContent}>
          {!sidebarCollapsed ? (
            <div style={styles.brandLockup}>
              <div style={styles.brandTitleRow}>
                <span style={styles.brandTitle}>YASHMEEN</span>
                <span style={styles.cityBadge}>DUBAI</span>
              </div>
              <div style={styles.hairlineRule}></div>
              <div style={styles.sidebarSubtitle}>ADMIN ATELIER · 01</div>
            </div>
          ) : (
            <div style={styles.collapsedBadge}>Y</div>
          )}

          <button
            style={styles.collapseBtn}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? "›" : "‹"}
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <div style={styles.navScrollArea}>
        <div style={sidebarCollapsed ? styles.hiddenOnCollapse : styles.sectionLabel}>
          (MANAGEMENT)
        </div>

        <ul style={styles.menu}>
          {menuItems.map(
            (item) =>
              item?.role === user?.usertype && (
                <li key={item.id} style={styles.menuItem}>
                  {item.submenu ? (
                    <>
                      <div
                        style={styles.menuLink}
                        onClick={() => toggleSubmenu(item.id)}
                      >
                        <div style={styles.menuLinkContent}>
                          <span style={styles.menuIcon}>{item.icon}</span>
                          <span
                            style={
                              sidebarCollapsed ? styles.hiddenOnCollapse : styles.menuText
                            }
                          >
                            {item.name}
                          </span>
                        </div>
                        <span
                          style={{
                            ...styles.submenuArrow,
                            ...(openSubmenus[item.id]
                              ? styles.submenuArrowOpen
                              : {}),
                            ...(sidebarCollapsed ? styles.hiddenOnCollapse : {}),
                          }}
                        >
                          <FiChevronRight size={13} />
                        </span>
                      </div>
                      <ul
                        style={{
                          ...styles.submenu,
                          ...(openSubmenus[item.id] ? styles.submenuOpen : {}),
                          ...(sidebarCollapsed ? { display: "none" } : {}),
                        }}
                      >
                        {item.submenu.map((subItem, idx) => (
                          <li
                            key={idx}
                            style={styles.submenuItem}
                            onClick={() => navigate(subItem.link)}
                          >
                            <Link
                              to={subItem.link}
                              style={{
                                ...styles.submenuLink,
                                ...(isLinkActive(subItem.link)
                                  ? styles.submenuLinkActive
                                  : {}),
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                if (handleMenuClick) handleMenuClick(subItem.name, item.name);
                              }}
                            >
                              {subItem.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <Link
                      to={item.link}
                      style={{
                        ...styles.menuLink,
                        ...(isLinkActive(item.link)
                          ? styles.menuLinkActive
                          : {}),
                      }}
                      onClick={() => {
                        if (handleMenuClick) handleMenuClick(item.name);
                      }}
                    >
                      <div style={styles.menuLinkContent}>
                        <span
                          style={{
                            ...styles.menuIcon,
                            color: isLinkActive(item.link) ? "#ffffff" : "#000000",
                          }}
                        >
                          {item.icon}
                        </span>
                        <span
                          style={
                            sidebarCollapsed ? styles.hiddenOnCollapse : styles.menuText
                          }
                        >
                          {item.name}
                        </span>
                      </div>
                    </Link>
                  )}
                </li>
              ),
          )}
        </ul>
      </div>

      {/* Atelier Footer Telemetry */}
      {!sidebarCollapsed && (
        <div style={styles.sidebarFooter}>
          <div style={styles.footerDetails}>
            <div style={styles.footerTag}>AL QUOZ ATELIER</div>
            <div style={styles.footerMetric}>35,000 SQ. FT. FACILITY</div>
          </div>
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.liveSiteLink}
          >
            <span>VIEW LIVE SITE</span>
            <FiExternalLink size={12} />
          </Link>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;

const styles = {
  sidebar: {
    position: "fixed",
    left: 0,
    top: 0,
    height: "100vh",
    width: "280px",
    background: "#ffffff",
    borderRight: "1px solid #000000",
    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    zIndex: 1000,
    boxShadow: "2px 0 12px rgba(0, 0, 0, 0.05)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    transform: window.innerWidth <= 768 ? "translateX(-100%)" : "translateX(0)",
    userSelect: "none",
  },
  sidebarActive: {
    transform: "translateX(0)",
  },
  sidebarCollapsed: {
    width: "80px",
  },
  hiddenOnCollapse: {
    display: "none",
  },
  sidebarHeader: {
    padding: "24px 20px 20px 20px",
    borderBottom: "1px solid #000000",
    background: "#ffffff",
  },
  sidebarHeaderContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandLockup: {
    display: "flex",
    flexDirection: "column",
  },
  brandTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  brandTitle: {
    fontSize: "17px",
    fontWeight: 800,
    color: "#000000",
    letterSpacing: "0.08em",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  cityBadge: {
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "#000000",
    background: "#ffffff",
    border: "1px solid #000000",
    padding: "2px 7px",
    borderRadius: "9999px",
  },
  hairlineRule: {
    height: "1px",
    background: "#000000",
    margin: "10px 0 6px 0",
    width: "100%",
  },
  sidebarSubtitle: {
    fontSize: "10px",
    color: "#666666",
    letterSpacing: "0.1em",
    fontWeight: 700,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  collapsedBadge: {
    width: "36px",
    height: "36px",
    borderRadius: "6px",
    background: "#000000",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  collapseBtn: {
    background: "#ffffff",
    border: "1px solid #000000",
    color: "#000000",
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s ease",
  },
  navScrollArea: {
    flex: 1,
    overflowY: "auto",
    padding: "18px 0",
  },
  sectionLabel: {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "#888888",
    padding: "0 22px 10px 22px",
    textTransform: "uppercase",
  },
  menu: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  menuItem: {
    margin: "3px 12px",
  },
  menuLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    color: "#333333",
    textDecoration: "none",
    borderRadius: "6px",
    transition: "all 0.15s ease",
    fontSize: "13.5px",
    fontWeight: 600,
    cursor: "pointer",
    userSelect: "none",
  },
  menuLinkActive: {
    background: "#000000",
    color: "#ffffff",
    fontWeight: 700,
  },
  menuLinkContent: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  menuIcon: {
    width: "18px",
    height: "18px",
    color: "#000000",
    fontSize: "17px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    letterSpacing: "-0.01em",
  },
  submenuArrow: {
    color: "#888888",
    display: "flex",
    alignItems: "center",
    transition: "transform 0.2s ease",
  },
  submenuArrowOpen: {
    transform: "rotate(90deg)",
    color: "#000000",
  },
  submenu: {
    maxHeight: 0,
    overflow: "hidden",
    transition: "max-height 0.25s ease",
    background: "#f8f8f8",
    margin: "4px 0 4px 12px",
    borderRadius: "6px",
    borderLeft: "2px solid #000000",
    listStyle: "none",
    paddingLeft: 0,
  },
  submenuOpen: {
    maxHeight: "500px",
  },
  submenuItem: {
    margin: 0,
  },
  submenuLink: {
    display: "flex",
    alignItems: "center",
    padding: "8px 14px 8px 18px",
    color: "#444444",
    textDecoration: "none",
    fontSize: "12.5px",
    transition: "all 0.15s ease",
    borderRadius: "4px",
    cursor: "pointer",
  },
  submenuLinkActive: {
    color: "#000000",
    fontWeight: 700,
  },
  sidebarFooter: {
    padding: "16px 20px 22px 20px",
    background: "#ffffff",
    borderTop: "1px solid #000000",
  },
  footerDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    marginBottom: "14px",
  },
  footerTag: {
    fontSize: "10px",
    letterSpacing: "0.12em",
    fontWeight: 700,
    color: "#777777",
  },
  footerMetric: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#000000",
    letterSpacing: "0.04em",
  },
  liveSiteLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 14px",
    background: "#ffffff",
    border: "1px solid #000000",
    borderRadius: "9999px",
    color: "#000000",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textDecoration: "none",
    transition: "all 0.15s ease",
  },
};
