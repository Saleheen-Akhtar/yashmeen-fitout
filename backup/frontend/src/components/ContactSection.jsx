import { useMemo, useState } from "react";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import useWebDetails from "../hooks/cacheStore";
import { enquiryAPI } from "../services/api";

const FALLBACK = {
  mobile: "+971 54 386 2870",
  email: "info@yfbfitoutcontracting.com",
  address: "Bay Square, Building 12, Office G01, Marasi Dr, Business Bay, Dubai, UAE",
};
const SERVICES = ["Interior Fit-Out", "Interior Design", "Villa Renovation", "Office Fit-Out", "Joinery Works", "MEP"];
const INITIAL = { name: "", mobile: "", email: "", service: SERVICES[0], message: "" };

export default function ContactSection() {
  const details = useWebDetails();
  const [form, setForm] = useState(INITIAL);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState("");

  const { mobile, email, address } = useMemo(() => {
    const a = details?.address;
    let text = a ? [a.street, a.city, a.state, a.zipCode, a.country].filter(Boolean).join(", ") : "";
    if (!text || text.includes("Dubai , Dubai") || text.includes("Office0q")) text = FALLBACK.address;
    return { mobile: details?.mobile || FALLBACK.mobile, email: details?.email || FALLBACK.email, address: text };
  }, [details]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setErrorMsg("");
    try {
      await enquiryAPI.create({
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        services: form.service,
        message: form.message.trim(),
      });
      setStatus("sent");
      setForm(INITIAL);
    } catch (err) {
      const res = err?.response?.data;
      const fieldErr = res?.errors && Object.values(res.errors).find(Boolean);
      setErrorMsg(fieldErr || res?.message || "We could not send your enquiry. Please try again or call us.");
      setStatus("error");
    }
  };

  return (
    <section className="section" id="contact">
      <div className="wrap contact-grid">
        <div>
          <p className="eyebrow" data-reveal>Contact</p>
          <h2 className="section-title contact-title" data-split>Let us build your space.</h2>
          <p className="contact-lede">
            Share a few details and we will reply within one working day with next steps.
          </p>
          <ul className="contact-list" data-stagger>
            <li><FiPhone aria-hidden="true" /><a href={`tel:${mobile.replace(/\s+/g, "")}`}>{mobile}</a></li>
            <li><FiMail aria-hidden="true" /><a href={`mailto:${email}`}>{email}</a></li>
            <li><FiMapPin aria-hidden="true" /><span>{address}</span></li>
          </ul>
        </div>

        <form className="contact-form card" data-reveal onSubmit={submit} noValidate={false}>
          {status === "sent" ? (
            <div role="status" className="form-done">
              <h3>Thank you. Enquiry received.</h3>
              <p>We will contact you within one working day.</p>
              <button type="button" className="btn btn-outline" onClick={() => setStatus("idle")}>Send another</button>
            </div>
          ) : (
            <>
              <div className="field">
                <label htmlFor="c-name">Full name</label>
                <input id="c-name" required autoComplete="name" value={form.name} onChange={set("name")} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="c-mobile">Mobile</label>
                  <input id="c-mobile" type="tel" required autoComplete="tel" value={form.mobile} onChange={set("mobile")} />
                </div>
                <div className="field">
                  <label htmlFor="c-email">Email</label>
                  <input id="c-email" type="email" required autoComplete="email" value={form.email} onChange={set("email")} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="c-service">Service</label>
                <select id="c-service" value={form.service} onChange={set("service")}>
                  {SERVICES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="c-message">Project details</label>
                <textarea id="c-message" required value={form.message} onChange={set("message")} />
                <span className="hint">Location, size and timeline help us reply faster.</span>
              </div>
              {status === "error" && <p className="error" role="alert">{errorMsg}</p>}
              <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Sending..." : "Send enquiry"}
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}
