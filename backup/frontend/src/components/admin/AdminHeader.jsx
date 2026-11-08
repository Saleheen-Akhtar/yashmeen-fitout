import { useState, useEffect } from "react";
import useCreateStore from "../../store";
import { getInitials } from "../../libs/helpers";
import { Link, useNavigate } from "react-router-dom";
import { FiExternalLink, FiLogOut, FiUser, FiBell, FiMenu } from "react-icons/fi";

const AdminHeader = ({
  activeMenu,
  activeBreadcrumb,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [dubaiTime, setDubaiTime] = useState("");
  const [isOpenOffice, setIsOpenOffice] = useState(false);

  const { user, logout } = useCreateStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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

  return (
    <header style={styles.header}>
      {/* Left: Menu toggle + Architectural Title & Breadcrumb */}
      <div style={styles.headerLeft}>
        <button
          style={styles.menuToggle}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle Navigation Menu"
        >
          <FiMenu size={22} />
        </button>

        <div style={styles.headerTitle}>
          <div style={styles.breadcrumb}>
            <span style={styles.breadcrumbBrand}>YASHMEEN ATELIER</span>
            <span style={styles.breadcrumbSep}>/</span>
            <span style={styles.breadcrumbActive}>
              {activeMenu || "DASHBOARD"}
            </span>
          </div>
          <h1 style={styles.headerTitleText}>
            {activeMenu || "Website Details"}
          </h1>
        </div>
      </div>

      {/* Right: Telemetry, Live Site Pill, Notification, User */}
      <div style={styles.headerRight}>
        {/* Dubai Live Telemetry Pill */}
        <div style={styles.telemetryPill}>
          <span
            style={{
              ...styles.pulseDot,
              background: isOpenOffice ? "#2e7d32" : "#b18a4f",
            }}
          />
          <span style={styles.telemetryTime}>
            DUBAI {dubaiTime} GST
          </span>
          <span style={styles.telemetryStatus}>
            {isOpenOffice ? "OPEN" : "STUDIO"}
          </span>
        </div>

        {/* View Live Website Button */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.viewSiteBtn}
        >
          <span>VIEW SITE</span>
          <FiExternalLink size={12} />
        </Link>

        {/* Notification Bell */}
        <button style={styles.notificationBtn} aria-label="Notifications">
          <FiBell size={17} />
          <span style={styles.notificationBadge}>3</span>
        </button>

        {/* User Profile Pill */}
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
                  style={styles.avatarImg}
                />
              ) : (
                getInitials(user?.name || "Admin")
              )}
            </div>

            <div style={styles.userInfo}>
              <span style={styles.userName}>{user?.name || "Admin"}</span>
              <span style={styles.userRole}>
                {user?.usertype ? user.usertype.toUpperCase() : "DIRECTOR"}
              </span>
            </div>

            <span
              style={{
                ...styles.dropdownArrow,
                ...(userDropdownOpen ? styles.dropdownArrowOpen : {}),
              }}
            >
              ▾
            </span>
          </div>

          {/* User Dropdown */}
          {userDropdownOpen && (
            <div style={styles.userDropdown}>
              <div style={styles.dropdownHeader}>
                <div style={styles.dropdownUserName}>
                  {user?.name || "Admin"}
                </div>
                <div style={styles.userEmail}>
                  {user?.email || "admin@yashmeen.ae"}
                </div>
              </div>

              <div style={styles.dropdownMenu}>
                <div
                  style={styles.dropdownItem}
                  onClick={() => {
                    setUserDropdownOpen(false);
                    navigate("/dashboard");
                  }}
                >
                  <FiUser style={styles.dropdownIcon} />
                  <span>Atelier Overview</span>
                </div>

                <div style={styles.dropdownDivider} />

                <div
                  style={{
                    ...styles.dropdownItem,
                    ...styles.dropdownItemLogout,
                  }}
                  onClick={() => {
                    setUserDropdownOpen(false);
                    handleLogout();
                  }}
                >
                  <FiLogOut style={styles.dropdownIcon} />
                  <span>Sign Out</span>
                </div>
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
    background: "rgba(245, 243, 239, 0.95)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid #e7e4dc",
    padding: window.innerWidth > 768 ? "16px 40px" : "14px 16px",
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
    gap: "16px",
  },
  menuToggle: {
    display: window.innerWidth <= 768 ? "flex" : "none",
    background: "transparent",
    border: "1px solid #e2ded4",
    borderRadius: "8px",
    color: "#171613",
    padding: "6px",
    cursor: "pointer",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  breadcrumb: {
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  breadcrumbBrand: {
    color: "#b18a4f",
  },
  breadcrumbSep: {
    color: "#c2beb4",
  },
  breadcrumbActive: {
    color: "#737067",
  },
  headerTitleText: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#171613",
    letterSpacing: "-0.02em",
    margin: 0,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  telemetryPill: {
    display: window.innerWidth > 1024 ? "flex" : "none",
    alignItems: "center",
    gap: "8px",
    background: "#ffffff",
    border: "1px solid #e2ded4",
    padding: "6px 14px",
    borderRadius: "9999px",
    fontSize: "11px",
    letterSpacing: "0.05em",
  },
  pulseDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    boxShadow: "0 0 6px rgba(46, 125, 50, 0.5)",
  },
  telemetryTime: {
    fontWeight: 600,
    color: "#171613",
  },
  telemetryStatus: {
    color: "#b18a4f",
    fontWeight: 700,
    fontSize: "10px",
    letterSpacing: "0.1em",
  },
  viewSiteBtn: {
    display: window.innerWidth > 640 ? "inline-flex" : "none",
    alignItems: "center",
    gap: "6px",
    background: "#ffffff",
    border: "1px solid #171613",
    color: "#171613",
    borderRadius: "9999px",
    padding: "7px 16px",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textDecoration: "none",
    transition: "all 0.2s ease",
  },
  notificationBtn: {
    position: "relative",
    background: "#ffffff",
    border: "1px solid #e2ded4",
    color: "#171613",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  notificationBadge: {
    position: "absolute",
    top: "-3px",
    right: "-3px",
    background: "#b18a4f",
    color: "#ffffff",
    fontSize: "9px",
    fontWeight: 700,
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  userMenu: {
    position: "relative",
  },
  userProfile: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "4px 12px 4px 4px",
    background: "#ffffff",
    border: "1px solid #e2ded4",
    borderRadius: "9999px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  userAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#171613",
    border: "1px solid #b18a4f",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "12px",
    letterSpacing: "0.05em",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
  },
  userInfo: {
    display: window.innerWidth > 768 ? "flex" : "none",
    flexDirection: "column",
    textAlign: "left",
  },
  userName: {
    fontSize: "12.5px",
    fontWeight: 700,
    color: "#171613",
    lineHeight: 1.2,
  },
  userRole: {
    fontSize: "9.5px",
    fontWeight: 600,
    color: "#b18a4f",
    letterSpacing: "0.08em",
  },
  dropdownArrow: {
    fontSize: "10px",
    color: "#9c978b",
    transition: "transform 0.2s ease",
  },
  dropdownArrowOpen: {
    transform: "rotate(180deg)",
  },
  userDropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    background: "#ffffff",
    border: "1px solid #e7e4dc",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(8, 8, 7, 0.12)",
    minWidth: "220px",
    zIndex: 1001,
    overflow: "hidden",
  },
  dropdownHeader: {
    padding: "16px 18px",
    borderBottom: "1px solid #f1f0ee",
    background: "#fbf9f6",
  },
  dropdownUserName: {
    fontSize: "13.5px",
    fontWeight: 700,
    color: "#171613",
  },
  userEmail: {
    fontSize: "12px",
    color: "#737067",
    marginTop: "2px",
  },
  dropdownMenu: {
    padding: "8px 6px",
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    color: "#171613",
    fontSize: "13px",
    fontWeight: 500,
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  dropdownIcon: {
    color: "#b18a4f",
    fontSize: "15px",
  },
  dropdownDivider: {
    height: "1px",
    background: "#f1f0ee",
    margin: "6px 8px",
  },
  dropdownItemLogout: {
    color: "#c62828",
  },
};
