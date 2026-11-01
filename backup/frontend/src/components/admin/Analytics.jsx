import React from "react";

export default function Analytics({ title }) {
  const statsData = [
    {
      title: "Total Users",
      value: "1,234",
      change: "↑ 12% from last month",
      icon: "👥",
      color: "blue",
    },
    {
      title: "Total Orders",
      value: "856",
      change: "↑ 8% from last month",
      icon: "🛒",
      color: "green",
    },
    {
      title: "Products",
      value: "342",
      change: "↑ 5% from last month",
      icon: "📦",
      color: "purple",
    },
  ];
  return (
    <>
      <div style={styles.contentHeader}>
        <h2 style={styles.contentHeaderTitle}>{title}</h2>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {statsData.map((stat, idx) => (
          <div key={idx} style={styles.statCard}>
            <div style={styles.statHeader}>
              <h3 style={styles.statTitle}>{stat.title}</h3>
              <div
                style={{
                  ...styles.statIcon,
                  ...styles[
                    `statIcon${stat.color.charAt(0).toUpperCase() + stat.color.slice(1)}`
                  ],
                }}
              >
                {stat.icon}
              </div>
            </div>
            <div style={styles.statValue}>{stat.value}</div>
            <div
              style={{
                ...styles.statChange,
                ...(stat.negative ? styles.statChangeNegative : {}),
              }}
            >
              {stat.change}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

const styles = {
  contentHeader: {
    marginBottom: "30px",
  },
  contentHeaderTitle: {
    fontSize: "28px",
    color: "#2c3e50",
    marginBottom: "8px",
  },
  contentHeaderText: {
    color: "#7f8c8d",
    fontSize: "14px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      window.innerWidth > 768 ? "repeat(auto-fit, minmax(250px, 1fr))" : "1fr",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    border: "1px solid #f0f0f0",
    transition: "all 0.3s ease",
  },
  statHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  statTitle: {
    fontSize: "13px",
    color: "#95a5a6",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  statIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  statIconBlue: {
    background: "#e3f2fd",
    color: "#2196f3",
  },
  statIconGreen: {
    background: "#e8f5e9",
    color: "#4caf50",
  },
  statIconOrange: {
    background: "#fff3e0",
    color: "#ff9800",
  },
  statIconPurple: {
    background: "#f3e5f5",
    color: "#9c27b0",
  },
  statValue: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#2c3e50",
    marginBottom: "5px",
  },
  statChange: {
    fontSize: "13px",
    color: "#4caf50",
  },
  statChangeNegative: {
    color: "#e74c3c",
  },
};
