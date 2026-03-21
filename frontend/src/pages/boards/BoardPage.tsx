import { useState } from "react";
import Column from "./components/Column";
import TaskModal from "./components/TaskModal";
import CreateTaskModal from "./components/CreateTaskModal";

type Task = {
  id: number;
  title: string;
  type: string;
};

type ColumnType = {
  id: number;
  title: string;
  tasks: Task[];
};

export default function BoardPage() {
  // ✅ INITIAL DEFAULT COLUMNS (FIXED, NO TOGGLE)
  const [columns, setColumns] = useState<ColumnType[]>([
    {
      id: 1,
      title: "To Do",
      tasks: [
        { id: 1, title: "Design UI", type: "Task" },
        { id: 2, title: "Setup DB", type: "Story" },
      ],
    },
    {
      id: 2,
      title: "In Progress",
      tasks: [{ id: 3, title: "API Integration", type: "Task" }],
    },
    {
      id: 3,
      title: "Review",
      tasks: [{ id: 4, title: "Code Review", type: "Bug" }],
    },
    {
      id: 4,
      title: "Done",
      tasks: [{ id: 5, title: "Login Page", type: "Task" }],
    },
  ]);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<number | null>(null);

  // ✅ CREATE TASK
  const handleCreateTask = (newTask: Task) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === activeColumn
          ? { ...col, tasks: [...col.tasks, newTask] }
          : col
      )
    );
  };

  // ✅ ADD COLUMN AT SPECIFIC POSITION
  const addColumnAt = (index: number) => {
    const name = prompt("Enter column name");
    if (!name) return;

    const newColumn: ColumnType = {
      id: Date.now(),
      title: name,
      tasks: [],
    };

    setColumns((prev) => {
      const updated = [...prev];
      updated.splice(index, 0, newColumn); // 🔥 INSERT AT POSITION
      return updated;
    });
  };

  return (
    <div>
      {/* 🔥 HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 28 }}>Kanban Board</h2>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="secondary-btn">Add Workflow</button>
          <button className="secondary-btn">Edit Workflow</button>
        </div>
      </div>

      {/* 🔥 BOARD */}
      <div
  className="board-container"
  style={{
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
  }}
>
  {columns.map((col, index) => (
    <div
      key={col.id}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      {/* ➕ ADD BUTTON (ALIGNED TOP) */}
      <div
        style={{
          height: 50, // 🔥 SAME HEIGHT FOR ALL
          display: "flex",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => addColumnAt(index)}
          title="Add column here"
          style={{
            height: 40,
            width: 40,
            borderRadius: 10,
            border: "2px dashed #6366f1",
            background: "#eef2ff",
            color: "#4f46e5",
            fontSize: 20,
            fontWeight: "bold",
            cursor: "pointer",
            transition: "0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#6366f1";
            e.currentTarget.style.color = "white";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#eef2ff";
            e.currentTarget.style.color = "#4f46e5";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          +
        </button>
      </div>

      {/* 📦 COLUMN */}
      <Column
        column={col}
        onTaskClick={setSelectedTask}
        onAddTask={() => setActiveColumn(col.id)}
      />
    </div>
  ))}

  {/* ➕ ADD COLUMN AT END */}
  <div
    style={{
      height: 50,
      display: "flex",
      alignItems: "center",
    }}
  >
    <button
      onClick={() => addColumnAt(columns.length)}
      title="Add column at end"
      style={{
        height: 40,
        width: 40,
        borderRadius: 10,
        border: "2px dashed #6366f1",
        background: "#eef2ff",
        color: "#4f46e5",
        fontSize: 20,
        fontWeight: "bold",
        cursor: "pointer",
        transition: "0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#6366f1";
        e.currentTarget.style.color = "white";
        e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#eef2ff";
        e.currentTarget.style.color = "#4f46e5";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      +
    </button>
  </div>
</div>

      {/* 🔍 VIEW TASK */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* ➕ CREATE TASK */}
      {activeColumn && (
        <CreateTaskModal
          onClose={() => setActiveColumn(null)}
          onCreate={handleCreateTask}
        />
      )}
    </div>
  );
}