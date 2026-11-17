import { FiChevronLeft, FiChevronRight, FiEdit2 } from "react-icons/fi";
import { resolveImage, FALLBACK_PROJECT_IMG } from './dashboardData';

export default function FeaturedProjectCard({
  featuredProj,
  setFeaturedIndex,
  projects,
  openEditProjectModal,
  openCreateProjectModal,
}) {
  return (
    <div
      className="crex-card"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "290px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "18px",
        background: "#141311",
      }}
    >
      <img
        src={resolveImage(featuredProj.images?.[0])}
        alt={featuredProj.title}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = FALLBACK_PROJECT_IMG;
        }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "transform 0.4s ease",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(8,8,7,0.24) 0%, rgba(8,8,7,0.06) 45%, rgba(8,8,7,0.84) 100%)",
        }}
      />

      {/* Top Controls inside Photo Card */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            onClick={() =>
              setFeaturedIndex((i) =>
                i === 0 ? Math.max(projects.length - 1, 0) : i - 1
              )
            }
            className="crex-icon-circle"
            style={{ width: "30px", height: "30px", background: "rgba(255,255,255,0.24)", color: "#fff", border: "none", backdropFilter: "blur(8px)" }}
            title="Previous live project"
          >
            <FiChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => setFeaturedIndex((i) => i + 1)}
            className="crex-icon-circle"
            style={{ width: "30px", height: "30px", background: "rgba(255,255,255,0.24)", color: "#fff", border: "none", backdropFilter: "blur(8px)" }}
            title="Next live project"
          >
            <FiChevronRight size={14} />
          </button>
        </div>

        <button
          type="button"
          onClick={() =>
            featuredProj._id
              ? openEditProjectModal(featuredProj)
              : openCreateProjectModal()
          }
          style={{
            background: "rgba(255, 255, 255, 0.22)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "#ffffff",
            borderRadius: "9999px",
            padding: "5px 12px",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <FiEdit2 size={11} />
          <span>Edit Live</span>
        </button>
      </div>

      {/* Bottom Typography + Frosted Size Pill */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h3
            style={{
              fontSize: "19px",
              fontWeight: 600,
              color: "#ffffff",
              margin: "0 0 3px 0",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {featuredProj.title}
          </h3>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.82)", margin: 0 }}>
            {featuredProj.sector || "Architectural Works"} · {featuredProj.location || "Dubai"}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateProjectModal}
          style={{
            background: "rgba(255, 255, 255, 0.16)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            color: "#ffffff",
            borderRadius: "9999px",
            padding: "7px 14px",
            fontSize: "12px",
            fontWeight: 500,
            whiteSpace: "nowrap",
            cursor: "pointer",
            flexShrink: 0,
          }}
          title="Add new project to website"
        >
          {featuredProj.size || "+ New"}
        </button>
      </div>
    </div>
  );
}
