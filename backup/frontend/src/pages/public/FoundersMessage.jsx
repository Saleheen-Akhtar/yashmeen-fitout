import "../../styles/founders.css";
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
    <div className="page fm-page">

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
