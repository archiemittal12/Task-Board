import { useState } from "react";
import Column from "./components/Column";
import StoryCard from "./components/StoryCard";
import TaskModal from "./components/TaskModal";
import CreateTaskModal from "./components/CreateTaskModal";
import CreateStoryModal from "./components/CreateStoryModal";
import type { ColumnType, Story, Task } from "./types";

const initialStories: Story[] = [
  {
    id: 101,
    title: "Mobile App Revamp",
    description: "Improve onboarding, dashboard, and navigation.",
    createdAt: "20 March 2026",
    updatedAt: "21 March 2026",
  },
  {
    id: 102,
    title: "Booking Optimization",
    description: "Streamline booking steps and reduce friction.",
    createdAt: "19 March 2026",
    updatedAt: "21 March 2026",
  },
  {
    id: 103,
    title: "Billing System Overhaul",
    description: "Refactor invoices, subscriptions, and payments.",
    createdAt: "18 March 2026",
    updatedAt: "20 March 2026",
  },
  {
    id: 104,
    title: "Customer Feedback Loop",
    description: "Track, triage, and respond to customer feedback.",
    createdAt: "17 March 2026",
    updatedAt: "19 March 2026",
  },
];

const initialColumns: ColumnType[] = [
  {
    id: 1,
    title: "To Do",
    tasks: [
      {
        id: 1,
        title: "Design UI",
        description: "Create polished dashboard and login screens.",
        status: "To Do",
        type: "Task",
        priority: "High",
        assignee: "Priya",
        reporter: "Archie Mittal",
        dueDate: "2026-03-25",
        storyId: 101,
        comments: [
          {
            id: 11,
            author: "Archie Mittal",
            text: "Use clean spacing and rounded cards.",
            createdAt: "20 March 2026",
          },
        ],
      },
      {
        id: 2,
        title: "Fix signup bug",
        description: "Resolve validation issue in register form.",
        status: "To Do",
        type: "Bug",
        priority: "Critical",
        assignee: "Rohan",
        reporter: "Archie Mittal",
        dueDate: "2026-03-24",
        storyId: 101,
        comments: [],
      },
    ],
  },
  {
    id: 2,
    title: "In Progress",
    tasks: [
      {
        id: 3,
        title: "API Integration",
        description: "Connect frontend with backend project APIs.",
        status: "In Progress",
        type: "Task",
        priority: "Medium",
        assignee: "Nisha",
        reporter: "Archie Mittal",
        dueDate: "2026-03-26",
        storyId: 102,
        comments: [],
      },
    ],
  },
  {
    id: 3,
    title: "Review",
    tasks: [
      {
        id: 4,
        title: "Code Review",
        description: "Review board logic and refine task modal UX.",
        status: "Review",
        type: "Bug",
        priority: "Low",
        assignee: "Arjun",
        reporter: "Archie Mittal",
        dueDate: "2026-03-23",
        storyId: 103,
        comments: [],
      },
    ],
  },
  {
    id: 4,
    title: "Done",
    tasks: [
      {
        id: 5,
        title: "Login Page",
        description: "Created a polished split-screen login page.",
        status: "Done",
        type: "Task",
        priority: "Medium",
        assignee: "Archie Mittal",
        reporter: "Archie Mittal",
        dueDate: "2026-03-21",
        storyId: 101,
        comments: [],
      },
    ],
  },
];

const formatToday = () =>
  new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export default function BoardPage() {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [columns, setColumns] = useState<ColumnType[]>(initialColumns);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createTaskStatus, setCreateTaskStatus] = useState<string | null>(null);
  const [showStoryModal, setShowStoryModal] = useState(false);

  const storyTitleById = stories.reduce<Record<number, string>>((acc, story) => {
    acc[story.id] = story.title;
    return acc;
  }, {});

  const upsertTaskInColumns = (prevColumns: ColumnType[], task: Task) => {
    const targetStatus = prevColumns.some((column) => column.title === task.status)
      ? task.status
      : prevColumns[0]?.title || task.status;

    const normalizedTask: Task = {
      ...task,
      status: targetStatus,
    };

    const removedFromEveryColumn = prevColumns.map((column) => ({
      ...column,
      tasks: column.tasks.filter((existingTask) => existingTask.id !== task.id),
    }));

    return removedFromEveryColumn.map((column) => {
      if (column.title === targetStatus) {
        return {
          ...column,
          tasks: [...column.tasks, normalizedTask],
        };
      }
      return column;
    });
  };

  const handleCreateStory = (story: Story) => {
    setStories((prev) => [...prev, story]);
  };

  const handleCreateTask = (task: Task) => {
    setColumns((prev) => upsertTaskInColumns(prev, task));
  };

  const handleSaveTask = (task: Task) => {
    setColumns((prev) => upsertTaskInColumns(prev, task));
  };

  const handleDeleteTask = (taskId: number) => {
    setColumns((prev) =>
      prev.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== taskId),
      }))
    );
  };

  const addColumnAt = (index: number) => {
    const name = prompt("Enter column name");
    if (!name || !name.trim()) return;

    const newColumn: ColumnType = {
      id: Date.now(),
      title: name.trim(),
      tasks: [],
    };

    setColumns((prev) => {
      const updated = [...prev];
      updated.splice(index, 0, newColumn);
      return updated;
    });
  };

  const handleRenameColumn = (id: number) => {
    const nextName = prompt("Rename column");
    if (!nextName || !nextName.trim()) return;

    const newTitle = nextName.trim();

    setColumns((prev) =>
      prev.map((column) => {
        if (column.id !== id) return column;

        return {
          ...column,
          title: newTitle,
          tasks: column.tasks.map((task) => ({
            ...task,
            status: task.status === column.title ? newTitle : task.status,
          })),
        };
      })
    );
  };

  const handleDeleteColumn = (id: number) => {
    const confirmed = window.confirm("Delete this column?");
    if (!confirmed) return;

    setColumns((prev) => prev.filter((column) => column.id !== id));
  };

  const openCreateTask = (defaultStatus: string) => {
    setCreateTaskStatus(defaultStatus);
  };

  return (
    <div>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          gap: 16,
        }}
      >
        <h2 style={{ fontSize: 30, margin: 0 }}>Kanban Board</h2>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            style={{
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "10px 16px",
              cursor: "pointer",
              fontWeight: 700,
            }}
            onClick={() => setShowStoryModal(true)}
          >
            + Create Story
          </button>

          <button
            style={{
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "10px 16px",
              cursor: "pointer",
              fontWeight: 700,
            }}
            onClick={() => openCreateTask(columns[0]?.title || "To Do")}
          >
            + Create Task
          </button>

          <button
            style={{
              background: "#e2e8f0",
              color: "#0f172a",
              border: "none",
              borderRadius: 12,
              padding: "10px 16px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Add Workflow
          </button>

          <button
            style={{
              background: "#e2e8f0",
              color: "#0f172a",
              border: "none",
              borderRadius: 12,
              padding: "10px 16px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Edit Workflow
          </button>
        </div>
      </div>

      {/* STORIES */}
      <div style={{ marginBottom: 26 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
            gap: 12,
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 20 }}>Stories</h3>
            <p style={{ margin: "6px 0 0", color: "#64748b" }}>
              Story is the parent item. Tasks and bugs are linked to a story.
            </p>
          </div>

        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {stories.map((story) => {
            const storyTasks = columns
              .flatMap((column) => column.tasks)
              .filter((task) => task.storyId === story.id);

            const doneCount = storyTasks.filter((task) => task.status === "Done").length;

            return (
              <StoryCard
                key={story.id}
                story={story}
                taskCount={storyTasks.length}
                doneCount={doneCount}
                onEdit={(story) => {
                  const newTitle = prompt("Edit story title", story.title);
                  if (!newTitle) return;

                  setStories((prev) =>
                    prev.map((s) =>
                      s.id === story.id
                        ? { ...s, title: newTitle, updatedAt: formatToday() }
                        : s
                    )
                  );
                }}
                onDelete={(storyId) => {
                  const confirmed = window.confirm("Delete this story?");
                  if (!confirmed) return;

                  // remove story
                  setStories((prev) => prev.filter((s) => s.id !== storyId));

                  // ALSO remove tasks linked to this story (VERY IMPORTANT)
                  setColumns((prev) =>
                    prev.map((col) => ({
                      ...col,
                      tasks: col.tasks.filter((task) => task.storyId !== storyId),
                    }))
                  );
                }}
              />
            );
          })}
        </div>
      </div>

      {/* BOARD */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          overflowX: "auto",
          paddingBottom: 12,
        }}
      >
        {columns.map((column, index) => (
          <div
            key={column.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            {/* ADD COLUMN HERE */}
            <button
              onClick={() => addColumnAt(index)}
              title="Add column here"
              style={{
                marginTop: 44,
                height: 42,
                width: 42,
                minWidth: 42,
                borderRadius: 12,
                border: "2px dashed #6366f1",
                background: "#eef2ff",
                color: "#4f46e5",
                fontSize: 22,
                fontWeight: "bold",
                cursor: "pointer",
                transition: "0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#6366f1";
                e.currentTarget.style.color = "white";
                e.currentTarget.style.transform = "scale(1.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#eef2ff";
                e.currentTarget.style.color = "#4f46e5";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              +
            </button>

            <Column
              column={column}
              onTaskClick={setSelectedTask}
              onAddTask={() => openCreateTask(column.title)}
              onRename={() => handleRenameColumn(column.id)}
              onDelete={() => handleDeleteColumn(column.id)}
              storyTitleById={storyTitleById}
            />
          </div>
        ))}

        {/* ADD COLUMN AT END */}
        <button
          onClick={() => addColumnAt(columns.length)}
          title="Add column at end"
          style={{
            marginTop: 44,
            height: 42,
            width: 42,
            minWidth: 42,
            borderRadius: 12,
            border: "2px dashed #6366f1",
            background: "#eef2ff",
            color: "#4f46e5",
            fontSize: 22,
            fontWeight: "bold",
            cursor: "pointer",
            transition: "0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#6366f1";
            e.currentTarget.style.color = "white";
            e.currentTarget.style.transform = "scale(1.02)";
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

      {/* STORY MODAL */}
      {showStoryModal && (
        <CreateStoryModal
          onClose={() => setShowStoryModal(false)}
          onCreate={handleCreateStory}
        />
      )}

      {/* TASK CREATE MODAL */}
      {createTaskStatus && (
        <CreateTaskModal
          onClose={() => setCreateTaskStatus(null)}
          onCreate={handleCreateTask}
          stories={stories}
          columns={columns}
          defaultStatus={createTaskStatus}
        />
      )}

      {/* TASK EDIT MODAL */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          stories={stories}
          columns={columns}
          onClose={() => setSelectedTask(null)}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
}