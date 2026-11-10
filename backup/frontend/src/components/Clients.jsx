const TRUST_PARTNERS = [
  "Dubai Municipality Approved",
  "Civil Defence Certified",
  "Emaar Hospitality",
  "Palm Jumeirah Residences",
  "Emirates Hills Villas",
  "Damac Properties",
  "Sobha Realty",
  "DDA & Tecom Permitted",
  "DIFC Gate Precinct",
  "Nakheel Waterfront",
];

export default function ClientsSection() {
  return (
    <div className="clients-strip">
      <style>{`
        /* ============ AWWWARDS-TIER PEDIGREE MARQUEE ============ */
        .clients-strip {
          padding: 32px 0;
          background: #080706;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          overflow: hidden;
          position: relative;
        }

        .marquee-track {
          display: flex;
          gap: 40px;
          width: max-content;
          animation: marqueeScroll 35s linear infinite;
        }

        .marquee-track:hover {
          animation-play-state: paused;
        }

        .marquee-item {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(250, 247, 240, 0.7);
          white-space: nowrap;
          transition: color 0.25s ease;
        }

        .marquee-item:hover {
          color: var(--brass-light, #dfba73);
        }

        .marquee-bullet {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--brass, #c5a059);
          box-shadow: 0 0 8px rgba(197, 160, 89, 0.5);
        }

        @keyframes marqueeScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>

      <div className="marquee-track" aria-hidden="true">
        {TRUST_PARTNERS.concat(TRUST_PARTNERS).map((partner, index) => (
          <div key={`${partner}-${index}`} className="marquee-item">
            <span>{partner}</span>
            <span className="marquee-bullet" />
          </div>
        ))}
      </div>
    </div>
  );
}
