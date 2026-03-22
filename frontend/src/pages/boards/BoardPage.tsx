import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../../api/client";
import Column from "./components/Column";
import StoryCard from "./components/StoryCard";
import TaskModal from "./components/TaskModal";
import CreateTaskModal from "./components/CreateTaskModal";
import CreateStoryModal from "./components/CreateStoryModal";
import type { ColumnType, Story, Task } from "./types";

export default function BoardPage() {
  const { projectId, boardId } = useParams<{ projectId: string; boardId: string }>();
  
  const [stories, setStories] = useState<Story[]>([]);
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createTaskStatus, setCreateTaskStatus] = useState<string | null>(null);
  const [showStoryModal, setShowStoryModal] = useState(false);

  // Fetch Data from Backend
  const loadBoardData = async () => {
    if (!projectId || !boardId) return;
    setIsLoading(true);
    try {
      const [storiesRes, columnsRes] = await Promise.all([
        apiClient.get(`/projects/${projectId}/stories`),
        apiClient.get(`/projects/${projectId}/boards/${boardId}/columns`)
      ]);

      if (storiesRes.data.success) setStories(storiesRes.data.data);
      if (columnsRes.data.success) {
        // Map backend 'name' to frontend 'title'
        const fetchedColumns = columnsRes.data.data.map((col: any) => ({
          ...col,
          title: col.name,
          tasks: col.tasks || []
        }));
        setColumns(fetchedColumns);
      }
    } catch (error) {
      console.error("Failed to load board:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBoardData();
  }, [projectId, boardId]);

  const storyTitleById = stories.reduce<Record<string, string>>((acc, story) => {
    acc[story.id] = story.title;
    return acc;
  }, {});

  const handleCreateStory = () => {
    loadBoardData(); // Refresh to get the new story with its DB ID
  };

  const handleCreateTask = () => {
    loadBoardData(); // Refresh columns to show the new task
  };

  const handleSaveTask = () => {
    loadBoardData();
  };

  const handleDeleteTask = (taskId: string) => {
    setColumns((prev) =>
      prev.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== taskId),
      }))
    );
  };

  const openCreateTask = (defaultStatus: string) => {
    setCreateTaskStatus(defaultStatus);
  };

  if (isLoading) return <div style={{ padding: 40 }}>Loading Board...</div>;

  return (
    <div>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontSize: 30, margin: 0 }}>Kanban Board</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setShowStoryModal(true)} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 12, padding: "10px 16px", cursor: "pointer", fontWeight: 700 }}>
            + Create Story
          </button>
          <button onClick={() => openCreateTask("TODO")} style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 12, padding: "10px 16px", cursor: "pointer", fontWeight: 700 }}>
            + Create Task
          </button>
        </div>
      </div>

      {/* STORIES SECTION */}
      <div style={{ marginBottom: 26 }}>
        <h3 style={{ fontSize: 20 }}>Stories</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {stories.map((story) => {
            const storyTasks = columns.flatMap(c => c.tasks).filter(t => t.parentId === story.id);
            const doneCount = storyTasks.filter(t => t.status === "DONE").length;
            return (
              <StoryCard 
                key={story.id} 
                story={story} 
                taskCount={storyTasks.length} 
                doneCount={doneCount} 
                onEdit={() => {}} 
                onDelete={() => loadBoardData()} 
              />
            );
          })}
        </div>
      </div>

      {/* COLUMNS SECTION */}
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12 }}>
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            onTaskClick={setSelectedTask}
            onAddTask={() => openCreateTask(column.title)}
            onRename={() => {}}
            onDelete={() => {}}
            storyTitleById={storyTitleById}
          />
        ))}
      </div>

      {showStoryModal && <CreateStoryModal projectId={projectId!} onClose={() => setShowStoryModal(false)} onCreate={handleCreateStory} />}
      {createTaskStatus && (
        <CreateTaskModal 
          onClose={() => setCreateTaskStatus(null)} 
          onCreate={handleCreateTask} 
          stories={stories} 
          columns={columns} 
          defaultStatus={createTaskStatus} 
        />
      )}
      {selectedTask && (
        <TaskModal 
          task={selectedTask} 
          stories={stories} 
          columns={columns} 
          onClose={() => setSelectedTask(null)} 
          onSave={handleSaveTask} 
          onDelete={() => loadBoardData()} 
        />
      )}
    </div>
  );
}