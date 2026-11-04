const STATS = [
  { count: 10, suffix: "", label: "Years building in Dubai" },
  { count: 150, suffix: "+", label: "Projects delivered" },
  { count: 35000, suffix: " sq ft", label: "In-house Al Quoz workshop" },
  { text: "60-90", label: "Days to typical handover" },
];

export default function Numbers() {
  return (
    <section className="numbers">
      <div className="wrap">
        <p className="eyebrow numbers-eyebrow" data-reveal>In numbers</p>
        <dl className="numbers-grid" data-stagger>
          {STATS.map((s) => (
            <div key={s.label}>
              <dt
                {...(s.count ? { "data-count": s.count, "data-suffix": s.suffix } : {})}
              >
                {s.count ? s.count.toLocaleString("en-US") + s.suffix : s.text}
              </dt>
              <dd>{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
