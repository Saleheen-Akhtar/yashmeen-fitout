import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TbCategoryMinus } from "react-icons/tb";
import useCreateStore from "../../store";

import { FaRegBuilding } from "react-icons/fa";
import { FaPhotoVideo } from "react-icons/fa";
import { FaList } from "react-icons/fa";
import { GiJumpAcross } from "react-icons/gi";
import { GiVerticalBanner } from "react-icons/gi";
import { AiOutlineDashboard } from "react-icons/ai";
import { GrNotes } from "react-icons/gr";
import { MdOndemandVideo } from "react-icons/md";
import { IoMdChatbubbles } from "react-icons/io";
import { MdOutlineEmail } from "react-icons/md";
import { BsChatLeftQuote } from "react-icons/bs";

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
  // {
  //   id: "banner",
  //   name: "Banner",
  //   icon: <GiVerticalBanner />,
  //   link: "/dashboard/banner-manager",
  //   role: "admin",
  // },
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
  // {
  //   id: "products",
  //   name: "Products",
  //   icon: <TbCategoryMinus />,
  //   role: "admin",
  //   submenu: [
  //     { name: "All Products", link: "/product/list" },
  //     { name: "Add Product", link: "/product/add" },
  //   ],
  // },
];
const Sidebar = ({
  sidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  activeMenu,
  handleMenuClick,
}) => {
  const [openSubmenus, setOpenSubmenus] = useState({});
  const navigate = useNavigate();

  const { user } = useCreateStore();

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
      <div style={styles.sidebarHeader}>
        <div style={styles.sidebarHeaderContent}>
          <div>
            <h2
              style={{
                ...styles.sidebarTitle,
                ...(sidebarCollapsed ? styles.hiddenOnCollapse : {}),
              }}
            >
              Admin Hub
            </h2>
          </div>
          <button
            style={styles.collapseBtn}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? "»" : "«"}
          </button>
        </div>
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
                            sidebarCollapsed ? styles.hiddenOnCollapse : {}
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
                        ›
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
                              ...(activeMenu === subItem.name
                                ? styles.submenuLinkActive
                                : {}),
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              handleMenuClick(subItem.name, item.name);
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
                    style={{
                      ...styles.menuLink,
                      ...(activeMenu === item.name
                        ? styles.menuLinkActive
                        : {}),
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      handleMenuClick(item.name);
                      navigate(item.link);
                    }}
                  >
                    <div style={styles.menuLinkContent}>
                      <span style={styles.menuIcon}>{item.icon}</span>
                      <span
                        style={sidebarCollapsed ? styles.hiddenOnCollapse : {}}
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
    transition: "transform 0.3s ease",
    zIndex: 1000,
    boxShadow: "2px 0 15px rgba(0, 0, 0, 0.08)",
    overflowY: "auto",
    transform: window.innerWidth <= 768 ? "translateX(-100%)" : "translateX(0)",
  },
  sidebarActive: {
    transform: "translateX(0)",
  },
  sidebarHeader: {
    padding: "25px 20px",
    borderBottom: "1px solid #f0f0f0",
    background: "#5c6ac4",
    color: "white",
  },
  sidebarHeaderContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  collapseBtn: {
    background: "rgba(255, 255, 255, 0.2)",
    border: "none",
    color: "white",
    width: "32px",
    height: "32px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  sidebarCollapsed: {
    width: "80px",
  },
  hiddenOnCollapse: {
    opacity: 0,
    width: 0,
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  sidebarTitle: {
    fontSize: "22px",
    fontWeight: 600,
    marginBottom: "5px",
  },
  sidebarSubtitle: {
    fontSize: "13px",
    opacity: 0.9,
  },
  menu: {
    listStyle: "none",
    padding: "15px 0",
  },
  menuItem: {
    margin: "3px 12px",
  },
  menuLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 15px",
    color: "#5a6c7d",
    textDecoration: "none",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    userSelect: "none",
  },
  menuLinkActive: {
    background: "#eef0f8",
    color: "#5c6ac4",
  },
  menuLinkContent: {
    display: "flex",
    alignItems: "center",
    gap: "0px",
  },
  menuIcon: {
    width: "20px",
    height: "20px",
    marginRight: "12px",
    fontSize: "18px",
  },
  submenuArrow: {
    fontSize: "12px",
    transition: "transform 0.3s ease",
  },
  submenuArrowOpen: {
    transform: "rotate(90deg)",
  },
  submenu: {
    maxHeight: 0,
    overflow: "hidden",
    transition: "max-height 0.3s ease",
    background: "#fafbfc",
    margin: "5px 12px",
    borderRadius: "8px",
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
    padding: "10px 15px 10px 45px",
    color: "#6c7a89",
    textDecoration: "none",
    fontSize: "13px",
    transition: "all 0.2s ease",
    borderRadius: "6px",
    margin: "3px 8px",
    cursor: "pointer",
  },
  submenuLinkActive: {
    background: "#e8eaf6",
    color: "#5c6ac4",
    fontWeight: 500,
  },
  mainContent: {
    marginLeft: window.innerWidth > 768 ? "280px" : 0,
    minHeight: "100vh",
    transition: "margin-left 0.3s ease",
  },
};
