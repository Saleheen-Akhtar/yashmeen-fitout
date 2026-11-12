const FOUNDER = {
  name: "Mohammad Danish Adnan",
  title: "Founder & Managing Director",
};

function QuoteMark() {
  return (
    <svg width="30" height="22" viewBox="0 0 34 26" fill="none">
      <path
        d="M0 26V15.6C0 6.7 5.4 1 13.6 0l1.8 4.4C10 5.6 6.9 8.7 6.4 13.4H14V26H0ZM19.6 26V15.6C19.6 6.7 25 1 33.2 0L35 4.4c-5.4 1.2-8.5 4.3-9 9H33.6V26H19.6Z"
        fill="var(--brass)"
      />
    </svg>
  );
}

function SignatureMark() {
  return (
    <svg width="140" height="48" viewBox="0 0 150 52" fill="none">
      <path
        d="M6 40 C 14 14, 24 12, 28 30 C 31 42, 36 30, 40 18 C 44 8, 50 8, 48 24 C 47 34, 52 36, 60 24 C 66 15, 70 15, 68 26 C 67 33, 72 30, 78 20 C 84 11, 90 24, 84 32 C 80 38, 90 38, 98 24 C104 14, 110 14, 108 26 C107 33, 112 31, 118 22 C124 13, 132 18, 128 28 C126 33, 134 32, 142 22"
        stroke="var(--ink)"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FoundersMessage() {
  return (
    <div className="page">
      <style>{`

        :root{
          --ink:#1b1a17;
          --black:#fbfaf7;
          --gray-50:#f4f1ea;
          --gray-100:rgba(27,26,23,0.04);
          --gray-200:#e6e1d6;
          --gray-500:#6b665c;
          --brass:#8a6a28;
          --brass-deep:#6f541d;
          --font-display:var(--font-sans);
          --font-body:var(--font-sans);
          --max-w:1180px;
        }

        *{ box-sizing:border-box; }

        .page{
          min-height:100vh;
          width:100%;
          background:var(--black);
          color:var(--ink);
          font-family:var(--font-body);
        }

        a{ text-decoration:none; color:inherit; }

        .wrap{
          max-width:var(--max-w);
          margin:0 auto;
          padding:0 24px;
        }
        @media (min-width:768px){
          .wrap{ padding:0 40px; }
        }

        .eyebrow{
          display:flex;
          align-items:center;
          gap:8px;
          font-size:13px;
          font-weight:600;
          text-transform:uppercase;
          letter-spacing:0.14em;
          color:var(--brass-deep);
        }
        .eyebrow-bar{
          width:4px;
          height:16px;
          background:var(--brass);
          border-radius:1px;
        }

        /* HERO */
        .hero{
          position:relative;
          padding:18px 0;
          text-align:center;
          background-size:cover;
          background-position:center;
          isolation:isolate;
        }
        @media (min-width:768px){ 
        .hero{ padding:50px 0 50px; } }
        .hero::before{
          content:"";
          position:absolute;
          inset:0;
          background: #000;
          z-index:0;
        }
        .hero > .wrap{
          position:relative;
          z-index:1;
        }
        .hero-eyebrow{
          justify-content:center;
          color:var(--brass);
        }
        .hero-title{
          margin:18px 0 0;
          font-family:var(--font-display);
          font-weight:800;
          color:#FFFFFF;
          font-size:34px;
          line-height:1.18;
          letter-spacing:-0.01em;
        }
        @media (min-width:640px){ .hero-title{ font-size:46px; } }
        @media (min-width:1024px){ .hero-title{ font-size:56px; } }
        .hero-copy{
          margin:20px auto 0;
          max-width:560px;
          font-size:15.5px;
          line-height:1.75;
          color:rgba(255,255,255,0.78);
        }
        @media (min-width:640px){ .hero-copy{ font-size:16.5px; } }

        /* BODY */
        .body-section{ padding:64px 0 88px; }
        @media (min-width:768px){ .body-section{ padding:96px 0 112px; } }
        .body-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:40px;
          align-items:start;
        }
        @media (min-width:860px){
          .body-grid{ grid-template-columns:0.75fr 1.25fr; gap:64px; }
        }

        /* PORTRAIT COLUMN */
        .portrait-col{ position:static; }
        @media (min-width:860px){
          .portrait-col{ position:sticky; top:32px; }
        }
        .portrait-frame{
          width:100%;
          aspect-ratio:1/1;
          border-radius:10px;
          overflow:hidden;
          border:1px solid var(--gray-200);
        }
        .founder-name{
          margin-top:20px;
          font-family:var(--font-display);
          font-size:20px;
          font-weight:700;
          color:var(--ink);
        }
        .founder-title{
          margin-top:4px;
          font-size:13.5px;
          font-weight:600;
          color:var(--brass-deep);
          text-transform:uppercase;
          letter-spacing:0.08em;
        }
        .portrait-divider{
          margin-top:20px;
          height:1px;
          background:var(--gray-200);
        }
        .portrait-foot{
          margin-top:20px;
          font-size:13.5px;
          line-height:1.75;
          color:var(--gray-500);
        }

        /* LETTER */
        .letter-heading{
          margin:16px 0 0;
          font-family:var(--font-display);
          font-weight:700;
          font-size:30px;
          line-height:1.28;
          color:var(--ink);
        }
        @media (min-width:640px){ .letter-heading{ font-size:36px; } }
        .greeting{
          margin-top:28px;
          font-size:16.5px;
          font-weight:700;
          color:var(--ink);
        }
        .paragraph{
          margin-top:16px;
          font-size:15px;
          line-height:1.85;
          color:var(--gray-500);
        }

        .quote-box{
          margin:32px 0 8px;
          padding:28px 30px;
          background:var(--gray-50);
          border-left:3px solid var(--brass);
          border-radius:6px;
        }
        @media (min-width:640px){ .quote-box{ padding:30px 34px; } }
        .quote-text{
          margin-top:12px;
          font-family:var(--font-display);
          font-size:17px;
          font-weight:600;
          font-style:italic;
          color:var(--ink);
          line-height:1.55;
        }
        @media (min-width:640px){ .quote-text{ font-size:19px; } }

        .sign-off{ margin-top:40px; }
        .sign-off-line{
          font-size:15px;
          color:var(--gray-500);
          margin-bottom:4px;
        }
        .sign-off-name{
          margin-top:14px;
          font-family:var(--font-display);
          font-size:16px;
          font-weight:700;
          color:var(--ink);
        }
        .sign-off-title{
          margin-top:2px;
          font-size:13.5px;
          color:var(--gray-500);
        }

        /* STATS */
        .stats-section{
          background:var(--gray-50);
          border-top:1px solid var(--gray-200);
          border-bottom:1px solid var(--gray-200);
          padding:52px 0;
        }
        .stats-grid{
          display:grid;
          grid-template-columns:repeat(2,1fr);
          gap:32px 16px;
        }
        @media (min-width:768px){
          .stats-grid{ grid-template-columns:repeat(4,1fr); }
        }
        .stat{
          text-align:center;
          padding:0 8px;
          position:relative;
        }
        @media (min-width:768px){
          .stat:not(:first-child)::before{
            content:"";
            position:absolute;
            left:0;
            top:8px;
            bottom:8px;
            width:1px;
            background:var(--gray-200);
          }
        }
        .stat-value{
          font-family:var(--font-display);
          font-weight:800;
          font-size:34px;
          color:var(--brass-deep);
        }
        @media (min-width:640px){ .stat-value{ font-size:42px; } }
        .stat-label{
          margin-top:6px;
          font-size:13px;
          font-weight:500;
          text-transform:uppercase;
          letter-spacing:0.06em;
          color:var(--gray-500);
        }
      `}</style>

      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <h1 className="hero-title">A Message From Our Founder</h1>
          <p className="hero-copy">
            A few words from the team at Yashmeen Future Building & Fit-Out
            Company on why we started, what we&rsquo;ve learned, and where
            we&rsquo;re headed next.
          </p>
        </div>
      </section>

      {/* BODY */}
      <section className="body-section">
        <div className="wrap">
          <div className="body-grid">
            {/* Portrait */}
            <div className="portrait-col">
              <div className="portrait-frame">
                <img src="/static/founder.jpg" alt={FOUNDER.name} />
              </div>
              <div className="founder-name">{FOUNDER.name}</div>
              <div className="founder-title">{FOUNDER.title}</div>
              <div className="portrait-divider" />
              <p className="portrait-foot">
                Mohammad Danish Adnan founded Yashmeen Future Building & Fit-Out Company after a
                decade managing large-scale fit-out contracts across the Gulf,
                with a simple goal: run projects the way he&rsquo;d want them
                run if it were his own home.
              </p>
            </div>

            {/* Letter */}
            <div>
              <div className="eyebrow">
                <span className="eyebrow-bar" />
                Founder&rsquo;s Message
              </div>
              <h2 className="letter-heading">
                Building spaces people actually love coming back to.
              </h2>

              <p className="greeting">Dear Friends,</p>

              <p className="paragraph">
                When I started this company, I had one frustration I wanted to
                fix: too many fit-out projects in this region were being run as
                a series of handoffs - design here, execution there,
                accountability nowhere. I&rsquo;d seen good ideas get watered
                down by the time they reached the site, and good clients left
                chasing answers no one seemed to own.
              </p>

              <p className="paragraph">
                So at Yashmeen Future Building & Fit-Out Company, we built the
                opposite. One team, from first sketch to final handover.
                Designers who talk to the people installing the ceiling. Site
                managers who were in the room when the budget was set.
                It&rsquo;s a simple idea, but it&rsquo;s the one thing
                I&rsquo;ve refused to compromise on in fifteen years - because
                it&rsquo;s the difference between a space that looks good in
                renders and one that still works for you three years later.
              </p>

              <div className="quote-box">
                <QuoteMark />
                <p className="quote-text">
                  &ldquo;A good interior isn&rsquo;t the one that impresses on
                  handover day - it&rsquo;s the one you stop noticing, because
                  everything just works.&rdquo;
                </p>
              </div>

              <p className="paragraph">
                That philosophy is why we hold ourselves to ISO 9001, ISO 14001,
                and ISO 45001 standards on every contract, not just the large
                ones - and why our team still walks every site in Dubai and Abu
                Dhabi personally before we call a project done. We&rsquo;ve
                grown a lot since our first villa renovation, but the standard
                hasn&rsquo;t moved.
              </p>

              <p className="paragraph">
                To every client who trusted us with their home, office, or
                business - thank you. You&rsquo;re the reason this team gets to
                keep doing the work we love. And if you&rsquo;re considering
                Yashmeen Future Building & Fit-Out Company for your next
                project, I promise you&rsquo;ll get the same standard we&rsquo;d
                demand for our own space.
              </p>

              <div className="sign-off">
                <p className="sign-off-line">Warm regards,</p>
                <SignatureMark />
                <div className="sign-off-name">{FOUNDER.name}</div>
                <div className="sign-off-title">{FOUNDER.title}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
