import { FiBriefcase, FiFileText, FiLayers } from "react-icons/fi";

export default function DashboardHeader({
  user,
  loading,
  setActiveTab,
  projects,
  activeServicesCount,
  quotes,
  enquiries,
}) {
  const openWorkspace = (tab) => {
    setActiveTab(tab);
    document.getElementById("crm-cms-workspace")?.scrollIntoView({ behavior: "smooth" });
  };

  const stats = [
    { id: "projects", label: "Projects", value: projects.length, icon: FiLayers },
    { id: "services", label: "Live services", value: activeServicesCount, icon: FiBriefcase },
    { id: "leads", label: "Open requests", value: quotes.length + enquiries.length, icon: FiFileText },
  ];

  return (
    <section className="dashboard-intro">
      <div className="dashboard-intro-copy">
        <span className="workspace-kicker">Operations overview</span>
        <div className="dashboard-title-row">
          <h1>Welcome, {user?.name || "Yashmeen"}</h1>
          {loading && <span className="dashboard-sync">Syncing...</span>}
        </div>
        <p>
          Manage client requests, live website content, studio tasks, and site visits from one clear workspace.
        </p>
      </div>

      <div className="dashboard-stats" aria-label="Workspace totals">
        {stats.map(({ id, label, value, icon: Icon }) => (
          <button key={id} type="button" className="dashboard-stat" onClick={() => openWorkspace(id)}>
            <Icon size={15} aria-hidden="true" />
            <span>
              <strong>{value}</strong>
              <small>{label}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
