import { FiCheckCircle, FiCheck, FiX, FiPlus } from "react-icons/fi";

export default function TaskQueueCard({
  syncScore,
  activeServicesCount,
  setActiveTab,
  projects,
  tasks,
  completedTasksCount,
  handleToggleTask,
  addingTask,
  handleAddTask,
  newTaskText,
  setNewTaskText,
  setAddingTask,
}) {
  return (
    <div className="crex-col-right-stack">
      {/* Top-Right Onboarding / Website CMS Sync Card */}
      <div className="crex-card" style={{ padding: "20px 22px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
          }}
        >
          <span style={{ fontSize: "17px", fontWeight: 500, color: "var(--crex-ink)" }}>
            Web Sync
          </span>
          <span style={{ fontSize: "28px", fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1 }}>
            {syncScore}%
          </span>
        </div>

        {/* 3 Stacked Capsule Bars (Brass, Obsidian Ink, Muted Stone) */}
        <div style={{ display: "grid", gridTemplateColumns: "3fr 2.2fr 1.2fr", gap: "6px" }}>
          <div>
            <div style={{ fontSize: "10.5px", color: "var(--crex-muted)", marginBottom: "5px" }}>
              Services ({activeServicesCount})
            </div>
            <div
              onClick={() => setActiveTab("services")}
              style={{
                height: "36px",
                borderRadius: "10px",
                background: "var(--crex-brass)",
                color: "var(--crex-ink)",
                fontSize: "11px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                padding: "0 10px",
                cursor: "pointer",
              }}
            >
              Live
            </div>
          </div>

          <div>
            <div style={{ fontSize: "10.5px", color: "var(--crex-muted)", marginBottom: "5px" }}>
              Works ({projects.length})
            </div>
            <div
              onClick={() => setActiveTab("projects")}
              style={{
                height: "36px",
                borderRadius: "10px",
                background: "var(--crex-dark)",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                padding: "0 10px",
                cursor: "pointer",
              }}
            >
              DB
            </div>
          </div>

          <div>
            <div style={{ fontSize: "10.5px", color: "var(--crex-muted)", marginBottom: "5px" }}>
              Queue
            </div>
            <div
              style={{
                height: "36px",
                borderRadius: "10px",
                background: "#545454",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {tasks.length - completedTasksCount}
            </div>
          </div>
        </div>
      </div>

      {/* Tall Matte Obsidian Ink Task Queue Card */}
      <div
        className="crex-card-dark"
        style={{
          padding: "22px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "16.5px", fontWeight: 500, color: "#ffffff" }}>
              Studio & Web Queue
            </span>
            <span style={{ fontSize: "24px", fontWeight: 400, color: "#ffffff", letterSpacing: "-0.02em" }}>
              {completedTasksCount}/{tasks.length}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {tasks.slice(0, 6).map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "10px 4px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  cursor: "pointer",
                  transition: "opacity 0.15s ease",
                  opacity: task.completed ? 0.68 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "11px", minWidth: 0 }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.08)",
                      color: "#d6d4ce",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FiCheckCircle size={13} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "12.5px",
                        fontWeight: 500,
                        color: "#ffffff",
                        textDecoration: task.completed ? "line-through" : "none",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {task.title}
                    </div>
                    <div style={{ fontSize: "10.5px", color: "#a1a09b", marginTop: "2px" }}>
                      {task.subtitle}
                    </div>
                  </div>
                </div>

                {/* Check Circle */}
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: task.completed ? "#c5a059" : "rgba(255, 255, 255, 0.14)",
                    color: task.completed ? "#080807" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.2s ease",
                  }}
                >
                  <FiCheck size={11} strokeWidth={3} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inline Quick Task Adder */}
        <div style={{ marginTop: "14px" }}>
          {addingTask ? (
            <form onSubmit={handleAddTask} style={{ display: "flex", gap: "6px" }}>
              <input
                type="text"
                placeholder="New task or web update..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                autoFocus
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#ffffff",
                  borderRadius: "9999px",
                  padding: "6px 12px",
                  fontSize: "11.5px",
                }}
              />
              <button
                type="submit"
                className="crex-btn-accent"
                style={{ padding: "5px 12px", fontSize: "11px" }}
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setAddingTask(false)}
                style={{ background: "transparent", border: "none", color: "#a1a09b", cursor: "pointer" }}
              >
                <FiX size={14} />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setAddingTask(true)}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.07)",
                border: "1px dashed rgba(255,255,255,0.18)",
                borderRadius: "9999px",
                color: "#e6e4de",
                padding: "7px 12px",
                fontSize: "11.5px",
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <FiPlus size={12} />
              <span>Add Action Task</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
