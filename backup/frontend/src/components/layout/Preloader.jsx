export default function Preloader({ visible }) {
  return (
    <div className={`preloader${visible ? " is-visible" : ""}`} aria-hidden={!visible}>
      <div className="preloader-inner">
        <img src="/static/logo.jpg" alt="Yashmeen Future Building" className="preloader-logo" />
      </div>
    </div>
  );
}
