import {
  CalendarDays,
  Check,
  Circle,
  Clock3,
  Trash2,
} from "lucide-react";

import type {
  PlannerTask,
  TaskCategory,
  TaskPriority,
  TaskStatus,
} from "../types/planner";

type Props = {
  tasks: PlannerTask[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
};

const categoryLabels: Record<TaskCategory, string> = {
  coding: "Coding",
  learning: "Learning",
  personal: "Personal",
};

const priorityClasses: Record<TaskPriority, string> = {
  low: "text-slate-400 bg-white/[0.05]",
  medium: "text-sky-300 bg-sky-400/[0.08]",
  high: "text-amber-300 bg-amber-400/[0.08]",
  urgent: "text-rose-300 bg-rose-400/[0.08]",
};

const statusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  "in-progress": "In progress",
  done: "Done",
};

function formatDate(dateValue: string): string {
  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getNextStatus(status: TaskStatus): TaskStatus {
  if (status === "todo") return "in-progress";
  if (status === "in-progress") return "done";
  return "todo";
}

export function PlannerTaskList({
  tasks,
  onStatusChange,
  onDelete,
  compact = false,
}: Props) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.09] px-5 py-10 text-center">
        <CalendarDays size={24} className="mb-3 text-slate-600" />
        <p className="text-sm font-medium text-slate-300">Nothing scheduled</p>
        <p className="mt-1 text-xs text-slate-500">
          Add a task to start planning your work.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/[0.06]">
      {tasks.map((task) => {
        const overdue =
          task.status !== "done" &&
          task.dueDate < new Date().toLocaleDateString("en-CA");

        return (
          <article
            key={task.id}
            className="group flex items-start gap-3 py-3 first:pt-0 last:pb-0"
          >
            <button
              type="button"
              onClick={() =>
                onStatusChange(task.id, getNextStatus(task.status))
              }
              title={`Current status: ${statusLabels[task.status]}. Click to change.`}
              aria-label={`Change status for ${task.title}`}
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                task.status === "done"
                  ? "border-emerald-400 bg-emerald-400 text-slate-950"
                  : task.status === "in-progress"
                    ? "border-sky-400 text-sky-300"
                    : "border-slate-600 text-slate-600 hover:border-sky-400"
              }`}
            >
              {task.status === "done" ? (
                <Check size={12} />
              ) : task.status === "in-progress" ? (
                <Clock3 size={11} />
              ) : (
                <Circle size={9} />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <p
                className={`break-words text-sm font-medium ${
                  task.status === "done"
                    ? "text-slate-500 line-through"
                    : "text-slate-200"
                }`}
              >
                {task.title}
              </p>

              {!compact && task.description && (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {task.description}
                </p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-white/[0.045] px-2 py-1 text-[10px] text-slate-400">
                  {categoryLabels[task.category]}
                </span>

                <span
                  className={`rounded-md px-2 py-1 text-[10px] ${priorityClasses[task.priority]}`}
                >
                  {task.priority}
                </span>

                {!compact && (
                  <span className="text-[10px] text-slate-600">
                    {statusLabels[task.status]}
                  </span>
                )}
              </div>

              <p
                className={`mt-2 flex items-center gap-1.5 text-[10px] ${
                  overdue ? "text-rose-300" : "text-slate-500"
                }`}
              >
                <CalendarDays size={11} />
                {overdue ? "Overdue · " : ""}
                {formatDate(task.dueDate)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onDelete(task.id)}
              aria-label={`Delete ${task.title}`}
              title="Delete task"
              className="rounded-md p-1.5 text-slate-600 opacity-100 transition hover:bg-rose-400/10 hover:text-rose-300 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
          </article>
        );
      })}
    </div>
  );
}