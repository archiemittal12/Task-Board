// 1. Aligned with Prisma Enums (Uppercase)
export type TaskType = "STORY" | "TASK" | "BUG";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

// Added a basic User interface to handle relations
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface Story {
  id: string;
  title: string;
  description: string | null;
  priority?: TaskPriority;
  dueDate?: string | null;
  status?: TaskStatus | string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  content: string; // Changed from 'text' to match Prisma 'content'
  taskId: string;
  userId: string;
  user?: User; // Populated when you fetch comments with include: { user: true }
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus | string;
  type: TaskType;
  priority: TaskPriority;
  position?: number;
  dueDate: string | null;
  projectId: string;
  columnId: string | null;
  parentId: string | null; // Changed from 'storyId' to match Prisma 'parentId'

  // IDs for references
  assigneeId: string | null;
  reporterId: string | null;

  // Optional populated objects (available when using getTaskById)
  assignee?: User | null;
  reporter?: User | null;
  comments?: TaskComment[];

  createdAt: string;
  updatedAt: string;
}

export interface ColumnType {
  id: string;
  title: string; // We map this from 'name' in BoardPage.tsx
  status: TaskStatus | string;
  position?: number;
  wipLimit?: number | null;
  tasks: Task[];
}
