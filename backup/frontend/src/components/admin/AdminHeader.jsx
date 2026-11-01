import { useState } from "react";
import useCreateStore from "../../store";
import { getInitials } from "../../libs/helpers";
import { Link, useNavigate } from "react-router-dom";

const AdminHeader = ({
  activeMenu,
  activeBreadcrumb,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { user, logout } = useCreateStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <header style={styles.header}>
      <div style={styles.headerLeft}>
        <button
          style={styles.menuToggle}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>
        <div style={styles.headerTitle}>
          <h1 style={styles.headerTitleText}>{activeMenu}</h1>
          <div style={styles.breadcrumb}>{activeBreadcrumb}</div>
        </div>
      </div>

      <div style={styles.headerRight}>
        <button style={styles.notificationBtn}>
          🔔
          <span style={styles.notificationBadge}>3</span>
        </button>

        <div style={styles.userMenu}>
          <div
            style={styles.userProfile}
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
          >
            <div style={styles.userAvatar}>
              {user?.avatar ? (
                <img
                  src={user?.avatar}
                  alt="Avatar"
                  style={styles.userAvatar}
                />
              ) : (
                getInitials(user?.name)
              )}
            </div>
            <span
              style={{
                ...styles.dropdownArrow,
                ...(userDropdownOpen ? styles.dropdownArrowOpen : {}),
              }}
            >
              ▼
            </span>
          </div>

          {userDropdownOpen && (
            <div style={styles.userDropdown}>
              <div style={styles.dropdownHeader}>
                <div style={styles.dropdownUserName}>{user?.name}</div>
                <div style={styles.userEmail}>{user?.username}</div>
              </div>
              <div style={styles.dropdownMenu}>
                <Link
                  to="javascript:void(0)"
                  style={styles.dropdownItem}
                  onClick={() => navigate("/user/profile")}
                >
                  <span style={styles.dropdownIcon}>👤</span>
                  My Profile
                </Link>
                <div style={styles.dropdownDivider}></div>
                <Link
                  href="javascript:void(0)"
                  style={{
                    ...styles.dropdownItem,
                    ...styles.dropdownItemLogout,
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                >
                  <span style={styles.dropdownIcon}>🚪</span>
                  Logout
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default AdminHeader;

const styles = {
  header: {
    background: "#ffffff",
    padding: "18px 30px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
  },
  menuToggle: {
    display: window.innerWidth <= 768 ? "block" : "none",
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#5c6ac4",
    marginRight: "15px",
    padding: "5px",
  },
  headerTitle: {
    display: "flex",
    flexDirection: "column",
  },
  headerTitleText: {
    fontSize: "24px",
    color: "#2c3e50",
    fontWeight: 600,
  },
  breadcrumb: {
    fontSize: "13px",
    color: "#95a5a6",
    marginTop: "3px",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  searchBar: {
    position: "relative",
    display: window.innerWidth > 768 ? "block" : "none",
  },
  searchInput: {
    padding: "10px 15px 10px 40px",
    border: "1px solid #e0e0e0",
    borderRadius: "25px",
    fontSize: "14px",
    width: "250px",
    transition: "all 0.3s ease",
  },
  searchIcon: {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#95a5a6",
  },
  notificationBtn: {
    position: "relative",
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "#5a6c7d",
    padding: "8px",
    borderRadius: "50%",
    transition: "all 0.2s ease",
  },
  notificationBadge: {
    position: "absolute",
    top: "5px",
    right: "5px",
    background: "#e74c3c",
    color: "white",
    fontSize: "10px",
    padding: "2px 5px",
    borderRadius: "10px",
    fontWeight: 600,
  },
  userMenu: {
    position: "relative",
  },
  userProfile: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 12px",
    background: "#f8f9fa",
    borderRadius: "25px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "1px solid transparent",
  },
  userAvatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#5c6ac4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: 600,
    fontSize: "15px",
  },
  userInfo: {
    display: window.innerWidth > 768 ? "flex" : "none",
    flexDirection: "column",
    textAlign: "left",
  },
  userName: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#2c3e50",
  },
  userRole: {
    fontSize: "12px",
    color: "#95a5a6",
  },
  dropdownArrow: {
    fontSize: "12px",
    color: "#95a5a6",
    marginLeft: "5px",
    transition: "transform 0.3s ease",
  },
  dropdownArrowOpen: {
    transform: "rotate(180deg)",
  },
  userDropdown: {
    position: "absolute",
    top: "100%",
    right: window.innerWidth <= 768 ? "-10px" : 0,
    marginTop: "10px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.12)",
    minWidth: "220px",
    zIndex: 1001,
  },
  dropdownHeader: {
    padding: "15px 20px",
    borderBottom: "1px solid #f0f0f0",
  },
  dropdownUserName: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#2c3e50",
  },
  userEmail: {
    fontSize: "13px",
    color: "#95a5a6",
    marginTop: "3px",
  },
  dropdownMenu: {
    padding: "8px 0",
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    padding: "12px 20px",
    color: "#5a6c7d",
    textDecoration: "none",
    fontSize: "14px",
    transition: "all 0.2s ease",
    cursor: "pointer",
  },
  dropdownIcon: {
    marginRight: "12px",
    fontSize: "16px",
  },
  dropdownDivider: {
    height: "1px",
    background: "#f0f0f0",
    margin: "8px 0",
  },
  dropdownItemLogout: {
    color: "#e74c3c",
  },
};
