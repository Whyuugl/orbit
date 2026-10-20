import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type PlannerTask,
} from "../types/planner";

const STORAGE_KEY = "orbit.planner.tasks.v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidTask(value: unknown): value is PlannerTask {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    TASK_CATEGORIES.some((item) => item === value.category) &&
    TASK_STATUSES.some((item) => item === value.status) &&
    TASK_PRIORITIES.some((item) => item === value.priority) &&
    typeof value.dueDate === "string" &&
    (typeof value.repositoryId === "number" ||
      value.repositoryId === null) &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

export function loadPlannerTasks(): PlannerTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isValidTask);
  } catch {
    return [];
  }
}

export function savePlannerTasks(tasks: PlannerTask[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch {
    return false;
  }
}