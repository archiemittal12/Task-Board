export type TaskType = "Task" | "Bug";
export type TaskPriority = "Low" | "Medium" | "High" | "Critical";

export interface Story {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: number;
  author: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  type: TaskType;
  priority: TaskPriority;
  assignee: string;
  reporter: string;
  dueDate: string;
  storyId: number;
  comments: TaskComment[];
}

export interface ColumnType {
  id: number;
  title: string;
  tasks: Task[];
}