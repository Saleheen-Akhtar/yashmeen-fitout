import { FiArrowUpRight } from "react-icons/fi";
import { STAGES } from "./dashboardData";

export default function PipelineProgressCard({
  allCRMItems,
  setActiveTab,
  weeklyBars,
}) {
  const stageCounts = STAGES.map((stg) => ({
    ...stg,
    count: allCRMItems.filter((item) => item.stage === stg.id).length,
  }));

  return (
    <div
      className="crex-card crex-pipeline-span"
      style={{
        padding: "22px 24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "290px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
        <div>
          <span className="workspace-kicker" style={{ display: "block", marginBottom: "4px" }}>
            Pipeline overview
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
            <span style={{ fontSize: "36px", fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1 }}>
              {allCRMItems.length}
            </span>
            <span style={{ fontSize: "12px", color: "var(--crex-muted)", lineHeight: 1.3 }}>
              Active fit-out records
              <br />
              across all stages
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setActiveTab("kanban");
            document.getElementById("crm-cms-workspace")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="crex-icon-circle"
          title="Open CRM Pipeline Kanban"
          aria-label="Open CRM Pipeline Kanban"
        >
          <FiArrowUpRight size={15} />
        </button>
      </div>

      {/* Stage distribution summary & 7-day velocity chart */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.9fr",
          gap: "24px",
          alignItems: "end",
          marginTop: "16px",
        }}
      >
        {/* Left: Stage breakdown badges */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {stageCounts.map((stg) => (
              <button
                key={stg.id}
                type="button"
                className={stg.badgeClass}
                style={{
                  fontSize: "11px",
                  padding: "4px 10px",
                  cursor: "pointer",
                  border: "none",
                }}
                onClick={() => {
                  setActiveTab("kanban");
                  document.getElementById("crm-cms-workspace")?.scrollIntoView({ behavior: "smooth" });
                }}
                title={`Filter ${stg.name} in Kanban`}
              >
                <span>{stg.name}:</span>
                <strong style={{ marginLeft: "4px" }}>{stg.count}</strong>
              </button>
            ))}
          </div>
          <span style={{ fontSize: "11px", color: "var(--crex-muted)", marginTop: "4px" }}>
            Real-time stage distribution across sales workflow
          </span>
        </div>

        {/* Right: 7 Vertical Dotted Tracks with Obsidian & Champagne Brass Capsule Bars */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            alignItems: "end",
            height: "120px",
            gap: "8px",
          }}
        >
          {weeklyBars.map((bar, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: "100%",
                justifyContent: "flex-end",
                position: "relative",
              }}
              title={`${bar.day}: ${bar.label}`}
            >
              {bar.highlight && (
                <div
                  style={{
                    position: "absolute",
                    top: "-6px",
                    background: "var(--crex-brass)",
                    color: "#ffffff",
                    fontSize: "9.5px",
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: "9999px",
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 8px rgba(138, 106, 40, 0.25)",
                    zIndex: 2,
                  }}
                >
                  {bar.label}
                </div>
              )}

              <div
                style={{
                  position: "relative",
                  width: "10px",
                  height: "85px",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "4px",
                    bottom: "4px",
                    width: "2px",
                    borderLeft: "2px dotted rgba(8, 8, 7, 0.14)",
                  }}
                />
                <div
                  style={{
                    position: "relative",
                    width: "10px",
                    height: `${bar.h}%`,
                    borderRadius: "9999px",
                    background: bar.highlight ? "var(--crex-brass)" : "var(--crex-dark)",
                    transition: "height 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    zIndex: 1,
                  }}
                />
              </div>

              <span
                style={{
                  fontSize: "10.5px",
                  fontWeight: 600,
                  color: bar.highlight ? "var(--crex-ink)" : "var(--crex-muted-soft)",
                  marginTop: "6px",
                }}
              >
                {bar.day}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
