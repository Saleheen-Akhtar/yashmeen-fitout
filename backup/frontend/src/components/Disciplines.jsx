import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";

const SERVICES = [
  {
    title: "Interior fit-out",
    desc: "Villas, penthouses and apartments, from concept and 3D renders to MEP and final handover.",
    img: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1100&q=80",
    alt: "Living room with built-in joinery",
    href: "/services/interior-design",
  },
  {
    title: "Joinery and millwork",
    desc: "Wall panelling, kitchens and dressing rooms made in our own Al Quoz workshop.",
    img: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=1100&q=80",
    alt: "Custom timber cabinetry",
    href: "/services/architecture",
  },
  {
    title: "Construction and approvals",
    desc: "Dubai Municipality, Civil Defence, DDA and Trakhees approvals handled by our engineers.",
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1100&q=80",
    alt: "Site engineers reviewing plans",
    href: "/services/construction",
  },
  {
    title: "Office renovation",
    desc: "Glass partitions, acoustic ceilings, smart lighting and compliant MEP for working offices.",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1100&q=80",
    alt: "Open plan office with glass partitions",
    href: "/services/office-renovation",
  },
];

export default function DisciplinesSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="section svc2-section" id="services">
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow" data-reveal>What we do</p>
          <h2 className="section-title" data-split>Four services, one accountable team.</h2>
        </div>

        <div className="svc2">
          <ul className="svc2-list" data-stagger>
            {SERVICES.map((s, i) => (
              <li key={s.title} className={i === active ? "is-active" : undefined}>
                <Link
                  to={s.href}
                  className="svc2-row"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                >
                  <span className="svc2-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <span className="svc2-main">
                    <span className="svc2-title">{s.title}</span>
                    <span className="svc2-desc">{s.desc}</span>
                  </span>
                  <FiArrowUpRight className="svc2-arrow" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="svc2-preview" aria-hidden="true">
            {SERVICES.map((s, i) => (
              <img
                key={s.title}
                src={s.img}
                alt=""
                loading="lazy"
                width="1100"
                height="1375"
                className={i === active ? "is-active" : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
