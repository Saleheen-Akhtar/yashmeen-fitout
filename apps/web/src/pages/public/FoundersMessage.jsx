import { mediaFallback } from "../../lib/media";
import useWebsiteContent from "../../hooks/useWebsiteContent";
import "../../styles/founders.css";

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
  const { content } = useWebsiteContent();
  const pageCopy = content.pageCopy.FoundersMessage;
  const FOUNDER = pageCopy.founder;

  return (
    <div className="page fm-page">


      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <h1 className="hero-title">{pageCopy.a_message_from_our_founder}</h1>
          <p className="hero-copy">{pageCopy.a_few_words_from_the}</p>
        </div>
      </section>

      {/* BODY */}
      <section className="body-section">
        <div className="wrap">
          <div className="body-grid">
            {/* Portrait */}
            <div className="portrait-col">
              <div className="portrait-frame">
                <img onError={mediaFallback} src={pageCopy.image} alt={FOUNDER.name} />
              </div>
              <div className="founder-name">{FOUNDER.name}</div>
              <div className="founder-title">{FOUNDER.title}</div>
              <div className="portrait-divider" />
              <p className="portrait-foot">{pageCopy.mohammad_danish_adnan_founded_yashmeen}</p>
            </div>

            {/* Letter */}
            <div>
              <div className="eyebrow">
                <span className="eyebrow-bar" />{pageCopy.founders_message}</div>
              <h2 className="letter-heading">{pageCopy.building_spaces_people_actually_love}</h2>

              <p className="greeting">{pageCopy.dear_friends}</p>

              <p className="paragraph">{pageCopy.when_i_started_this_company}</p>

              <p className="paragraph">{pageCopy.so_at_yashmeen_future_building}</p>

              <div className="quote-box">
                <QuoteMark />
                <p className="quote-text">{pageCopy.a_good_interior_isnt_the}</p>
              </div>

              <p className="paragraph">{pageCopy.that_philosophy_is_why_we}</p>

              <p className="paragraph">{pageCopy.to_every_client_who_trusted}</p>

              <div className="sign-off">
                <p className="sign-off-line">{pageCopy.warm_regards}</p>
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
