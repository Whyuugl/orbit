export const TASK_CATEGORIES = [
  "coding",
  "learning",
  "personal",
] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export const TASK_STATUSES = [
  "todo",
  "in-progress",
  "done",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = [
  "low",
  "medium",
  "high",
  "urgent",
] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface PlannerTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  repositoryId: number | null;
  createdAt: string;
  updatedAt: string;
}

export type CreatePlannerTaskInput = Pick<
  PlannerTask,
  | "title"
  | "description"
  | "category"
  | "priority"
  | "dueDate"
  | "repositoryId"
>;

export type UpdatePlannerTaskInput = Partial<
  Omit<PlannerTask, "id" | "createdAt">
>;