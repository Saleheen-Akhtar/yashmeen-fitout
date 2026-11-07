const WORDS = ["Villas", "Penthouses", "Offices", "Hotels", "Joinery", "MEP", "Approvals", "Turnkey"];

export default function Marquee() {
  const row = (hidden) => (
    <ul className="marquee-row" aria-hidden={hidden || undefined}>
      {WORDS.map((w) => (
        <li key={w + hidden}>
          {w}
          <span className="marquee-dot" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee" role="presentation" data-nomotion>
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
