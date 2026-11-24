import { useMemo, useState } from "react";
import { FiCheck, FiPlus, FiX } from "react-icons/fi";

export default function TaskQueueCard({
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
  const [filter, setFilter] = useState("pending");
  const openItems = Math.max(tasks.length - completedTasksCount, 0);

  const displayTasks = useMemo(() => {
    if (filter === "pending") return tasks.filter((t) => !t.completed);
    if (filter === "done") return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  return (
    <section className="studio-card crex-col-right-stack">
      <header className="studio-card-head">
        <div>
          <span className="workspace-kicker">Studio operations</span>
          <h2>Action queue</h2>
        </div>
        <span className="workspace-status is-live">Live</span>
      </header>

      <div className="studio-metrics">
        <button type="button" onClick={() => setActiveTab("services")}>
          <strong>{activeServicesCount}</strong>
          <span>Services</span>
        </button>
        <button type="button" onClick={() => setActiveTab("projects")}>
          <strong>{projects.length}</strong>
          <span>Projects</span>
        </button>
        <div>
          <strong>{openItems}</strong>
          <span>To complete</span>
        </div>
      </div>

      <div className="task-queue-tabs" role="tablist" aria-label="Task queue filter">
        <button
          type="button"
          className={`task-queue-tab ${filter === "pending" ? "is-active" : ""}`}
          onClick={() => setFilter("pending")}
          aria-selected={filter === "pending"}
        >
          Pending ({openItems})
        </button>
        <button
          type="button"
          className={`task-queue-tab ${filter === "done" ? "is-active" : ""}`}
          onClick={() => setFilter("done")}
          aria-selected={filter === "done"}
        >
          Done ({completedTasksCount})
        </button>
        <button
          type="button"
          className={`task-queue-tab ${filter === "all" ? "is-active" : ""}`}
          onClick={() => setFilter("all")}
          aria-selected={filter === "all"}
        >
          All ({tasks.length})
        </button>
      </div>

      <div className="studio-task-list">
        {displayTasks.length === 0 ? (
          <div className="studio-empty">
            {filter === "pending"
              ? "All actions completed!"
              : filter === "done"
                ? "No completed tasks yet."
                : "No action tasks yet."}
          </div>
        ) : (
          displayTasks.slice(0, 4).map((task) => (
            <button
              key={task.id}
              type="button"
              className={`studio-task-row ${task.completed ? "is-complete" : ""}`}
              onClick={() => handleToggleTask(task.id)}
              title="Click to toggle status"
            >
              <span className="studio-task-check">
                {task.completed && <FiCheck size={12} strokeWidth={3} />}
              </span>
              <span className="studio-task-copy">
                <strong>{task.title}</strong>
                <small>{task.subtitle}</small>
              </span>
            </button>
          ))
        )}
      </div>

      {addingTask ? (
        <form className="studio-task-form" onSubmit={handleAddTask}>
          <input
            type="text"
            placeholder="Add a task or website update"
            value={newTaskText}
            onChange={(event) => setNewTaskText(event.target.value)}
            autoFocus
          />
          <button type="submit" className="adm-btn-primary">Add</button>
          <button
            type="button"
            className="studio-task-cancel"
            onClick={() => setAddingTask(false)}
            aria-label="Cancel adding task"
          >
            <FiX size={15} />
          </button>
        </form>
      ) : (
        <button type="button" className="studio-add-task" onClick={() => setAddingTask(true)}>
          <FiPlus size={14} />
          <span>Add action task</span>
        </button>
      )}
    </section>
  );
}
