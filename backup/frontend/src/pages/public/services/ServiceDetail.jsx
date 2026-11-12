import { useParams, Link } from "react-router-dom";
import { FiCheck, FiArrowUpRight } from "react-icons/fi";
import useWebsiteContent from "../../../hooks/useWebsiteContent";

export default function ServiceDetail() {
  const { slug } = useParams();
  const { content } = useWebsiteContent();
  const services = content?.services || [];
  const service =
    services.find((s) => s.slug === slug) ||
    services[0] || {
      title: "Architecture & Fit-Out",
      eyebrow: "YASHMEEN STUDIO",
      shortDesc: "Design, engineering & bespoke fabrication in Dubai.",
      description:
        "Complete design and turnkey execution delivered from our 35,000 sq. ft. Al Quoz facility.",
      image: "/static/studio.jpg",
      highlights: [
        "Concept Design & 3D Visualization",
        "Dubai Authority Approvals",
        "Bespoke Joinery Fabrication",
        "Turnkey Site Handover",
      ],
    };

  const openEnquiry = () => {
    window.dispatchEvent(new CustomEvent("open-questionnaire"));
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fbfaf7", color: "#1b1a17" }}>
      {/* Hero Band */}
      <section
        style={{
          position: "relative",
          minHeight: "52vh",
          display: "flex",
          alignItems: "flex-end",
          padding: "120px 24px 64px",
          backgroundImage: `url(${service.image || "/static/hero-aperture-v2.webp"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(20,20,18,0.45) 0%, rgba(16,16,14,0.82) 100%)",
          }}
        />
        <div style={{ position: "relative", zIndex: 2, maxWidth: "1180px", width: "100%", margin: "0 auto" }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#e6c77c",
              marginBottom: "14px",
            }}
          >
            {service.eyebrow || "YASHMEEN SERVICE"}
          </p>
          <h1
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
              fontWeight: 600,
              color: "#ffffff",
              margin: 0,
              letterSpacing: "-0.025em",
            }}
          >
            {service.title} | Yashmeen Future Building
          </h1>
        </div>
      </section>

      {/* Main Overview */}
      <section style={{ maxWidth: "1180px", margin: "0 auto", padding: "80px 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "48px",
            alignItems: "center",
          }}
        >
          <div>
            <span
              style={{
                display: "inline-block",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#8a6a28",
                marginBottom: "12px",
              }}
            >
              (DISCIPLINE OVERVIEW)
            </span>
            <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 600, margin: "0 0 18px 0" }}>
              {service.shortDesc}
            </h2>
            <p style={{ fontSize: "16px", lineHeight: 1.75, color: "#4b4840", marginBottom: "28px" }}>
              {service.description}
            </p>

            {Array.isArray(service.highlights) && service.highlights.length > 0 && (
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", display: "grid", gap: "12px" }}>
                {service.highlights.map((pt, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "15px", fontWeight: 500 }}>
                    <span
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "#f4f1ea",
                        color: "#8a6a28",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FiCheck size={13} />
                    </span>
                    {pt}
                  </li>
                ))}
              </ul>
            )}

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <button type="button" onClick={openEnquiry} className="btn-pill btn-pill-dark">
                <span>REQUEST CONSULTATION</span>
                <span className="g-circle" aria-hidden="true" />
              </button>
              <Link
                to="/projects"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "0 20px",
                  height: "46px",
                  borderRadius: "9999px",
                  border: "1px solid rgba(0,0,0,0.16)",
                  color: "#1b1a17",
                  fontSize: "12px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <span>VIEW COMPLETED PROJECTS</span>
                <FiArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          <div
            style={{
              borderRadius: "16px",
              overflow: "hidden",
              border: "1px solid rgba(0,0,0,0.08)",
              aspectRatio: "4 / 3",
              background: "#ece8df",
            }}
          >
            <img
              src={service.image || "/static/studio.jpg"}
              alt={service.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
