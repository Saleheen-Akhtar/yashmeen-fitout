import { FiLayers, FiBriefcase, FiFileText } from "react-icons/fi";

export default function DashboardHeader({
  user,
  loading,
  leadsPct,
  quotesPct,
  siteSyncPct,
  outputPct,
  setActiveTab,
  projects,
  activeServicesCount,
  quotes,
  enquiries,
}) {
  return (
    <section
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "24px",
        marginBottom: "26px",
      }}
    >
      {/* Left: Greeting + Status Capsules */}
      <div style={{ flex: "1 1 520px", maxWidth: "700px", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", margin: "0 0 18px 0" }}>
          <h1
            style={{
              fontSize: "clamp(26px, 3.2vw, 40px)",
              fontWeight: 500,
              color: "var(--crex-ink)",
              margin: 0,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Welcome in, {user?.name || "Yashmeen"}
          </h1>
          {loading && (
            <span
              className="badge-brass"
              style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: "9999px",
              }}
            >
              Syncing…
            </span>
          )}
        </div>

        {/* Segmented Horizontal Progress Strip */}
        <div
          className="crex-progress-strip"
          style={{
            gridTemplateColumns: `${leadsPct}fr ${quotesPct}fr ${siteSyncPct}fr ${outputPct}fr`,
          }}
        >
          {/* Bar 1: Leads (Obsidian Ink) */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 500, color: "var(--crex-muted)", marginBottom: "6px", paddingLeft: "4px" }}>
              Inquiries
            </div>
            <div
              style={{
                height: "30px",
                borderRadius: "9999px",
                background: "var(--crex-dark)",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                padding: "0 12px",
              }}
            >
              {leadsPct}%
            </div>
          </div>

          {/* Bar 2: Quotes (Brushed Champagne Brass) */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 500, color: "var(--crex-muted)", marginBottom: "6px", paddingLeft: "4px" }}>
              Quotes
            </div>
            <div
              style={{
                height: "30px",
                borderRadius: "9999px",
                background: "var(--crex-brass)",
                color: "var(--crex-ink)",
                fontSize: "11px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                padding: "0 12px",
              }}
            >
              {quotesPct}%
            </div>
          </div>

          {/* Bar 3: Site Sync (Signature Diagonal Hatched Capsule) */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 500, color: "var(--crex-muted)", marginBottom: "6px", paddingLeft: "4px" }}>
              Site Works
            </div>
            <div
              className="crex-hatched-bar"
              style={{
                height: "30px",
                borderRadius: "9999px",
                color: "var(--crex-muted)",
                fontSize: "11px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                padding: "0 14px",
              }}
            >
              {siteSyncPct}%
            </div>
          </div>

          {/* Bar 4: Services Ready (Hairline Outline Pill) */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 500, color: "var(--crex-muted)", marginBottom: "6px", paddingLeft: "4px" }}>
              Services
            </div>
            <div
              style={{
                height: "30px",
                borderRadius: "9999px",
                border: "1px solid var(--crex-line-strong)",
                background: "rgba(255, 255, 255, 0.55)",
                color: "var(--crex-ink)",
                fontSize: "11px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                padding: "0 12px",
              }}
            >
              {outputPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Right: Thin Giant Architectural Numerals */}
      <div className="crex-stats-row">
        <div
          onClick={() => {
            setActiveTab("projects");
            document.getElementById("crm-cms-workspace")?.scrollIntoView({ behavior: "smooth" });
          }}
          style={{ cursor: "pointer" }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <FiLayers size={15} color="#8a8a86" />
            <span style={{ fontSize: "42px", fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1 }}>
              {projects.length}
            </span>
          </div>
          <div style={{ fontSize: "11.5px", color: "var(--crex-muted)", marginTop: "4px", paddingLeft: "23px" }}>
            Projects
          </div>
        </div>

        <div
          onClick={() => {
            setActiveTab("services");
            document.getElementById("crm-cms-workspace")?.scrollIntoView({ behavior: "smooth" });
          }}
          style={{ cursor: "pointer" }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <FiBriefcase size={15} color="#8a8a86" />
            <span style={{ fontSize: "42px", fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1 }}>
              {activeServicesCount}
            </span>
          </div>
          <div style={{ fontSize: "11.5px", color: "var(--crex-muted)", marginTop: "4px", paddingLeft: "23px" }}>
            Services
          </div>
        </div>

        <div
          onClick={() => {
            setActiveTab("leads");
            document.getElementById("crm-cms-workspace")?.scrollIntoView({ behavior: "smooth" });
          }}
          style={{ cursor: "pointer" }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <FiFileText size={15} color="#8a8a86" />
            <span style={{ fontSize: "42px", fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1 }}>
              {quotes.length + enquiries.length}
            </span>
          </div>
          <div style={{ fontSize: "11.5px", color: "var(--crex-muted)", marginTop: "4px", paddingLeft: "23px" }}>
            Requests
          </div>
        </div>
      </div>
    </section>
  );
}
