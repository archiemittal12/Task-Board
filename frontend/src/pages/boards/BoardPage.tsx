import { useState } from "react";
import Column from "./components/Column";
import TaskModal from "./components/TaskModal";
import CreateTaskModal from "./components/CreateTaskModal";

export default function BoardPage() {
  const [columns, setColumns] = useState([
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
    tasks: [
      { id: 3, title: "API Integration", type: "Task" },
    ],
  },
  {
    id: 3,
    title: "Review",
    tasks: [
      { id: 4, title: "Code Review", type: "Bug" },
    ],
  },
  {
    id: 4,
    title: "Done",
    tasks: [
      { id: 5, title: "Login Page", type: "Task" },
    ],
  },
  ]);

  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [activeColumn, setActiveColumn] = useState<any>(null);

  // CREATE TASK FUNCTION
  const handleCreateTask = (newTask: any) => {
    const updated = columns.map((col) => {
      if (col.id === activeColumn) {
        return {
          ...col,
          tasks: [...col.tasks, newTask],
        };
      }
      return col;
    });

    setColumns(updated);
  };

  return (
    <div>
      <h2>Kanban Board</h2>

      <div className="board-container">
        {columns.map((col) => (
          <Column
            key={col.id}
            column={col}
            onTaskClick={setSelectedTask}
            onAddTask={() => setActiveColumn(col.id)}
          />
        ))}
      </div>

      {/* VIEW TASK */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* CREATE TASK */}
      {activeColumn && (
        <CreateTaskModal
          onClose={() => setActiveColumn(null)}
          onCreate={handleCreateTask}
        />
      )}
    </div>
  );
}