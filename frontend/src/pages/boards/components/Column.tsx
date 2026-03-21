import TaskCard from "./TaskCard";

export default function Column({
  column,
  onTaskClick,
  onAddTask,
}: any) {
  // 🎨 ICON STYLE
  const iconStyle = {
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    border: "none",
    borderRadius: 10,
    padding: "8px 10px",
    color: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    transition: "0.2s",
  };

  return (
    <div
      className="column"
      style={{
        minWidth: 280,
        background: "#f8fafc",
        borderRadius: 14,
        padding: 12,
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
      }}
    >
      {/* 🔥 COLUMN HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h3 style={{ fontSize: 18 }}>{column.title}</h3>

        {/* 🎯 ACTION BUTTONS */}
        <div style={{ display: "flex", gap: 6 }}>
          {/* ✏️ RENAME */}
          <button
            style={iconStyle}
            title="Rename Column"
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
            onClick={() => alert("Rename Column (UI later)")}
          >
            ✏️
          </button>

          {/* 🗑 DELETE */}
          <button
            style={iconStyle}
            title="Delete Column"
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
            onClick={() => alert("Delete Column (logic later)")}
          >
            🗑
          </button>
        </div>
      </div>

      {/* 📌 TASK LIST */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {column.tasks.map((task: any) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
          />
        ))}
      </div>

      {/* ➕ ADD TASK */}
      <button
        onClick={onAddTask}
        style={{
          marginTop: 12,
          width: "100%",
          padding: "10px",
          borderRadius: 10,
          border: "none",
          background: "#e2e8f0",
          cursor: "pointer",
          fontWeight: 500,
          transition: "0.2s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "#cbd5f5")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "#e2e8f0")
        }
      >
        + Add Task
      </button>
    </div>
  );
}