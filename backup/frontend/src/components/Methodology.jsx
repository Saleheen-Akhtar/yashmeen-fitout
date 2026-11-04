const STEPS = [
  { n: "01", title: "Brief and 3D design", desc: "Site survey, layouts and photorealistic renders. Every material is approved before we order." },
  { n: "02", title: "Authority approvals", desc: "Our engineers submit to Dubai Municipality, Civil Defence, DDA, Tecom and master developers." },
  { n: "03", title: "Workshop and site, in parallel", desc: "Joinery and metalwork are built in Al Quoz while MEP first-fix runs on site." },
  { n: "04", title: "Handover", desc: "Commissioning, authority completion certificate and a 12-month defects warranty." },
];

export default function MethodologySection() {
  return (
    <section className="section" id="process">
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow" data-reveal>How it works</p>
          <h2 className="section-title" data-split>From brief to handover in four steps.</h2>
        </div>
        <ol className="steps" data-stagger>
          {STEPS.map((s) => (
            <li key={s.n} className="line-draw" data-in>
              <span className="step-n" aria-hidden="true">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
