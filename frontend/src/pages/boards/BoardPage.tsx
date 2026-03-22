import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../../api/client";
import Column from "./components/Column";
import StoryCard from "./components/StoryCard";
import TaskModal from "./components/TaskModal";
import CreateTaskModal from "./components/CreateTaskModal";
import CreateStoryModal from "./components/CreateStoryModal";
import EditStoryModal from "./components/EditStoryModal";
import AddColumnModal from "./components/AddColumnModal";
import RenameColumnModal from "./components/RenameColumnModal";
import type { ColumnType, Story, Task } from "./types";

interface Member {
  userId: string;
  name: string;
  username: string;
  email: string;
  role: string;
}

function AddColumnButton({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        minWidth: 48, height: 48, margin: "6px 4px",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "2px dashed #cbd5e1", borderRadius: 12,
        cursor: "pointer", color: "#94a3b8", fontSize: 22,
        flexShrink: 0, transition: "0.2s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#6366f1";
        (e.currentTarget as HTMLDivElement).style.color = "#6366f1";
        (e.currentTarget as HTMLDivElement).style.background = "#eef2ff";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#cbd5e1";
        (e.currentTarget as HTMLDivElement).style.color = "#94a3b8";
        (e.currentTarget as HTMLDivElement).style.background = "transparent";
      }}
    >
      +
    </div>
  );
}

export default function BoardPage() {
  const { projectId, boardId } = useParams<{ projectId: string; boardId: string }>();

  const [stories, setStories] = useState<Story[]>([]);
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allProjectTasks, setAllProjectTasks] = useState<Task[]>([]);

  // modals
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createTaskColumnId, setCreateTaskColumnId] = useState<string | null | undefined>(undefined);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [addColumnPosition, setAddColumnPosition] = useState<{ after?: string; before?: string } | undefined>(undefined);
  const [renamingColumn, setRenamingColumn] = useState<ColumnType | null>(null);

  // ── drag state ──────────────────────────────────────
  const draggedTask = useRef<Task | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const draggedColumnId = useRef<string | null>(null);
  const [dragOverColTarget, setDragOverColTarget] = useState<string | null>(null);
  // ────────────────────────────────────────────────────

  const loadBoardData = async () => {
    if (!projectId || !boardId) {
      setError("Missing project or board ID.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [storiesRes, columnsRes, projectRes] = await Promise.all([
        apiClient.get(`/projects/${projectId}/stories`),
        apiClient.get(`/projects/${projectId}/boards/${boardId}/columns`),
        apiClient.get(`/projects/${projectId}`),
      ]);
      if (storiesRes.data.success) setStories(storiesRes.data.data);
      if (columnsRes.data.success) {
        setColumns(columnsRes.data.data.map((col: any) => ({
          ...col, title: col.name, tasks: col.tasks || [],
        })));
      }
      if (projectRes.data.project?.members) {
        setMembers(projectRes.data.project.members.map((m: any) => ({
          userId: m.user.id, name: m.user.name,
          username: m.user.username || m.user.email,
          email: m.user.email, role: m.role,
        })));
      }
      const allBoardsRes = await apiClient.get(`/projects/${projectId}/boards`);
      if (allBoardsRes.data.success) {
        const allBoards = allBoardsRes.data.data;
        const allColumnsResults = await Promise.all(
          allBoards.map((b: any) =>
            apiClient.get(`/projects/${projectId}/boards/${b.id}/columns`)
          )
        );
        const tasks = allColumnsResults
          .flatMap(res => res.data.success ? res.data.data : [])
          .flatMap((col: any) => col.tasks || []);
        setAllProjectTasks(tasks);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load board.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadBoardData(); }, [projectId, boardId]);

  // ── task drag handlers ────────────────────────────────
  const handleTaskDragStart = (e: React.DragEvent, task: Task) => {
    draggedTask.current = task;
    e.dataTransfer.setData("taskid", task.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleTaskDrop = async (
    targetColumnId: string,
    beforeTaskId?: string,
    afterTaskId?: string,
  ) => {
    const task = draggedTask.current;
    draggedTask.current = null;
    setDragOverColumnId(null);
    if (!task) return;

    // optimistic update
    setColumns(prev => {
      const next = prev.map(col => ({
        ...col,
        tasks: col.tasks.filter(t => t.id !== task.id),
      }));
      const targetCol = next.find(c => c.id === targetColumnId);
      if (!targetCol) return prev;

     const targetColumn = columns.find(c => c.id === targetColumnId);
      const updatedTask = { 
        ...task, 
        columnId: targetColumnId,
        status: targetColumn?.status ?? task.status  
      };
      if (!beforeTaskId && !afterTaskId) {
        targetCol.tasks.push(updatedTask);
      } else if (beforeTaskId) {
        const idx = targetCol.tasks.findIndex(t => t.id === beforeTaskId);
        targetCol.tasks.splice(idx, 0, updatedTask);
      } else if (afterTaskId) {
        const idx = targetCol.tasks.findIndex(t => t.id === afterTaskId);
        targetCol.tasks.splice(idx + 1, 0, updatedTask);
      }
      return [...next];
    });

    try {
      await apiClient.patch(
        `/projects/${projectId}/boards/${boardId}/columns/${task.columnId}/tasks/${task.id}/move`,
        { columnId: targetColumnId, beforeTaskId, afterTaskId },
      );
    } catch (err: any) {
      alert(err.response?.data?.message || "Move failed — check WIP limit or transition rules.");
      loadBoardData(); // revert on error
    }
  };

  // ── column drag handlers ──────────────────────────────
  const handleColumnDragStart = (e: React.DragEvent, columnId: string) => {
    // stop task drag from triggering
    if (e.dataTransfer.types.includes("taskid")) return;
    draggedColumnId.current = columnId;
    e.dataTransfer.setData("columnid", columnId);
    e.dataTransfer.effectAllowed = "move";
    // prevent the event from bubbling to task card
    e.stopPropagation();
  };

  const handleColumnDragOver = (e: React.DragEvent, columnId: string) => {
    if (!e.dataTransfer.types.includes("columnid")) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColTarget(columnId);
  };

  const handleColumnDrop = async (e: React.DragEvent, targetColumnId: string) => {
    if (!e.dataTransfer.types.includes("columnid")) return;
    e.preventDefault();
    const sourceId = draggedColumnId.current;
    draggedColumnId.current = null;
    setDragOverColTarget(null);

    if (!sourceId || sourceId === targetColumnId) return;

    const sourceIdx = columns.findIndex(c => c.id === sourceId);
    const targetIdx = columns.findIndex(c => c.id === targetColumnId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    // optimistic reorder
    const reordered = [...columns];
    const [moved] = reordered.splice(sourceIdx, 1);
    reordered.splice(targetIdx, 0, moved);
    setColumns(reordered);

    // calculate new position from neighbours
    const newIdx = targetIdx;
    const prev = reordered[newIdx - 1];
    const next = reordered[newIdx + 1];

    let newPosition: number;
    if (!prev) newPosition = (next?.position ?? 100) - 100;
    else if (!next) newPosition = (prev.position ?? 100) + 100;
    else newPosition = Math.floor(((prev.position ?? 0) + (next?.position ?? 0)) / 2);

    try {
      await apiClient.put(
        `/projects/${projectId}/boards/${boardId}/columns/${sourceId}`,
        { position: newPosition },
      );
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to reorder column.");
      loadBoardData(); // revert
    }
  };

  // ── story/column delete ───────────────────────────────
  const handleDeleteStory = async (storyId: string) => {
    if (!window.confirm("Delete this story? All child tasks will also be deleted.")) return;
    try {
      await apiClient.delete(`/projects/${projectId}/stories/${storyId}`);
      loadBoardData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete story");
    }
  };

  const handleDeleteColumn = async (column: ColumnType) => {
    if (column.tasks.length > 0) {
      alert("Cannot delete a column that has tasks. Move or delete the tasks first.");
      return;
    }
    if (!window.confirm(`Delete column "${column.title}"?`)) return;
    try {
      await apiClient.delete(`/projects/${projectId}/boards/${boardId}/columns/${column.id}`);
      loadBoardData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete column");
    }
  };

  const storyTitleById = stories.reduce<Record<string, string>>((acc, s) => {
    acc[s.id] = s.title;
    return acc;
  }, {});

  if (isLoading) return <div style={{ padding: 40 }}>Loading Board...</div>;
  if (error) return <div style={{ padding: 40, color: "red" }}>{error}</div>;

  return (
    <div>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, alignItems: "center" }}>
        <h2 style={{ fontSize: 30, margin: 0 }}>Kanban Board</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setShowStoryModal(true)} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 12, padding: "10px 16px", cursor: "pointer", fontWeight: 700 }}>
            + Create Story
          </button>
          <button onClick={() => setCreateTaskColumnId(null)} style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 12, padding: "10px 16px", cursor: "pointer", fontWeight: 700 }}>
            + Create Task
          </button>
        </div>
      </div>

      {/* STORIES */}
      <div style={{ marginBottom: 26 }}>
        <h3 style={{ fontSize: 18, marginBottom: 4 }}>Stories</h3>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 12 }}>Story is the parent item. Tasks and bugs are linked to a story.</p>
        {stories.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>No stories yet. Create one to get started.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {stories.map((story) => {
                // Use ALL project tasks, not just current board
                const storyTasks = allProjectTasks.filter(t => t.parentId === story.id);
                const doneCount = storyTasks.filter(t => t.status === "DONE").length;
                return (
                  <StoryCard
                    key={story.id} story={story}
                    taskCount={storyTasks.length} doneCount={doneCount}
                    allTasks={allProjectTasks}
                    onEdit={(s) => setEditingStory(s)}
                    onDelete={handleDeleteStory}
                  />
                );
              })}
          </div>
        )}
      </div>

      {/* COLUMNS */}
      {columns.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
          <p>No columns yet.</p>
          <button onClick={() => setAddColumnPosition({})} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontWeight: 600 }}>
            + Add First Column
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 0, overflowX: "auto", paddingBottom: 16, alignItems: "flex-start" }}>
          <AddColumnButton onClick={() => setAddColumnPosition(
              columns.length > 0 ? { before: columns[0].id } : {}
            )} />
          {columns.map((column) => (
            <div key={column.id} style={{ display: "flex", alignItems: "flex-start" }}>
              <Column
                column={column}
                onTaskClick={setSelectedTask}
                onAddTask={() => setCreateTaskColumnId(column.id)}
                onRename={() => setRenamingColumn(column)}
                onDelete={() => handleDeleteColumn(column)}
                storyTitleById={storyTitleById}
                onTaskDragStart={handleTaskDragStart}
                onTaskDrop={handleTaskDrop}
                onColumnDragStart={handleColumnDragStart}
                onColumnDragOver={handleColumnDragOver}
                onColumnDrop={handleColumnDrop}
                isDragOverColumn={dragOverColTarget === column.id && draggedColumnId.current !== column.id}
              />
              <AddColumnButton onClick={() => setAddColumnPosition({ after: column.id })} />
            </div>
          ))}
        </div>
      )}

      {/* MODALS */}
      {showStoryModal && <CreateStoryModal projectId={projectId!} onClose={() => setShowStoryModal(false)} onCreate={loadBoardData} />}
      {editingStory && <EditStoryModal projectId={projectId!} story={editingStory} onClose={() => setEditingStory(null)} onSave={loadBoardData} />}
              {addColumnPosition !== undefined && (
          <AddColumnModal
            projectId={projectId!}
            boardId={boardId!}
            afterColumnId={addColumnPosition.after}
            beforeColumnId={addColumnPosition.before}
            onClose={() => setAddColumnPosition(undefined)}
            onCreate={loadBoardData}
          />
        )}
      {renamingColumn && <RenameColumnModal projectId={projectId!} boardId={boardId!} column={renamingColumn} onClose={() => setRenamingColumn(null)} onSave={loadBoardData} />}
      {createTaskColumnId !== undefined && (
        <CreateTaskModal projectId={projectId!} boardId={boardId!} onClose={() => setCreateTaskColumnId(undefined)} onCreate={loadBoardData} stories={stories} columns={columns} defaultColumnId={createTaskColumnId} members={members} />
      )}
      {selectedTask && (
        <TaskModal task={selectedTask} stories={stories} columns={columns} boardId={boardId!} members={members} onClose={() => setSelectedTask(null)} onSave={loadBoardData} onDelete={loadBoardData} />
      )}
    </div>
  );
}