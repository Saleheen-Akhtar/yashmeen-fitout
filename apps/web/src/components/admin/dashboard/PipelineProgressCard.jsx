import { FiArrowUpRight } from "react-icons/fi";

export default function PipelineProgressCard({
  allCRMItems,
  setActiveTab,
  weeklyBars,
}) {
  return (
    <div
      className="crex-card"
      style={{
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "290px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "17px", fontWeight: 500, color: "var(--crex-ink)" }}>
            Progress
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginTop: "8px" }}>
            <span style={{ fontSize: "34px", fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1 }}>
              {allCRMItems.length}
            </span>
            <span style={{ fontSize: "11px", color: "var(--crex-muted)", lineHeight: 1.3 }}>
              Active Deals
              <br />
              in pipeline
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
          title="Open Pipeline Kanban"
        >
          <FiArrowUpRight size={15} />
        </button>
      </div>

      {/* 7 Vertical Dotted Tracks with Obsidian & Champagne Brass Capsule Bars */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          alignItems: "end",
          height: "145px",
          gap: "8px",
          marginTop: "12px",
          paddingTop: "16px",
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
            {/* Floating Brass Badge above Peak Bar */}
            {bar.highlight && (
              <div
                style={{
                  position: "absolute",
                  top: "-6px",
                  background: "var(--crex-brass)",
                  color: "var(--crex-ink)",
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: "9999px",
                  whiteSpace: "nowrap",
                  boxShadow: "0 2px 8px rgba(197, 160, 89, 0.34)",
                  zIndex: 2,
                }}
              >
                {bar.label}
              </div>
            )}

            {/* Dotted Spine Behind Capsule */}
            <div
              style={{
                position: "relative",
                width: "10px",
                height: "102px",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "8px",
                  bottom: "8px",
                  width: "2px",
                  borderLeft: "2px dotted rgba(8, 8, 7, 0.14)",
                }}
              />
              {/* Solid Pill Bar */}
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
                marginTop: "8px",
              }}
            >
              {bar.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
