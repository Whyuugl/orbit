
import { useMemo, useState } from "react";
import { CalendarDays, Circle, Clock3, Trash2 } from "lucide-react";

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
};

const COLUMNS: {
  status: TaskStatus;
  label: string;
  description: string;
}[] = [
  {
    status: "todo",
    label: "To do",
    description: "Ready to start",
  },
  {
    status: "in-progress",
    label: "In progress",
    description: "Currently working",
  },
  {
    status: "done",
    label: "Done",
    description: "Completed tasks",
  },
];

const CATEGORY_LABELS: Record<TaskCategory, string> = {
  coding: "Coding",
  learning: "Learning",
  personal: "Personal",
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function formatDueDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getTodayKey(): string {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function PlannerBoard({
  tasks,
  onStatusChange,
  onDelete,
}: Props) {
  const [categoryFilter, setCategoryFilter] = useState<
    TaskCategory | "all"
  >("all");

  const [priorityFilter, setPriorityFilter] = useState<
    TaskPriority | "all"
  >("all");

  const today = getTodayKey();

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(
        (task) =>
          categoryFilter === "all" ||
          task.category === categoryFilter,
      )
      .filter(
        (task) =>
          priorityFilter === "all" ||
          task.priority === priorityFilter,
      )
      .toSorted((a, b) => {
        if (a.status === "done" && b.status !== "done") return 1;
        if (a.status !== "done" && b.status === "done") return -1;

        const priorityDifference =
          PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];

        if (priorityDifference !== 0) return priorityDifference;

        return a.dueDate.localeCompare(b.dueDate);
      });
  }, [tasks, categoryFilter, priorityFilter]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 rounded-xl border border-white/[0.07] bg-[#141519] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">
            Task board
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {filteredTasks.length} of {tasks.length} tasks
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="planner-category-filter">
            Filter by category
          </label>
          <select
            id="planner-category-filter"
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(
                event.target.value as TaskCategory | "all",
              )
            }
            className="rounded-lg border border-white/[0.08] bg-[#1b1c21] px-3 py-2 text-xs text-slate-300 outline-none focus:border-sky-300/40"
          >
            <option value="all">All categories</option>
            <option value="coding">Coding</option>
            <option value="learning">Learning</option>
            <option value="personal">Personal</option>
          </select>

          <label className="sr-only" htmlFor="planner-priority-filter">
            Filter by priority
          </label>
          <select
            id="planner-priority-filter"
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(
                event.target.value as TaskPriority | "all",
              )
            }
            className="rounded-lg border border-white/[0.08] bg-[#1b1c21] px-3 py-2 text-xs text-slate-300 outline-none focus:border-sky-300/40"
          >
            <option value="all">All priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        {COLUMNS.map((column) => {
          const columnTasks = filteredTasks.filter(
            (task) => task.status === column.status,
          );

          return (
            <section
              key={column.status}
              className="min-w-0 rounded-xl border border-white/[0.07] bg-[#141519] p-3 sm:p-4"
            >
              <div className="mb-4 flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <Circle
                    size={15}
                    className={`mt-0.5 shrink-0 ${
                      column.status === "done"
                        ? "text-emerald-400"
                        : column.status === "in-progress"
                          ? "text-sky-300"
                          : "text-slate-500"
                    }`}
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {column.label}
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {column.description}
                    </p>
                  </div>
                </div>

                <span className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-1 text-[10px] tabular-nums text-slate-400">
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {columnTasks.map((task) => {
                  const overdue =
                    task.status !== "done" && task.dueDate < today;

                  return (
                    <article
                      key={task.id}
                      className="rounded-lg border border-white/[0.07] bg-[#191a1f] p-3 transition hover:border-white/[0.13]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={`min-w-0 break-words text-[13px] font-medium ${
                            task.status === "done"
                              ? "text-slate-400"
                              : "text-slate-100"
                          }`}
                        >
                          {task.title}
                        </h4>

                        <button
                          type="button"
                          onClick={() => onDelete(task.id)}
                          aria-label={`Delete ${task.title}`}
                          title="Delete task"
                          className="shrink-0 rounded-md p-1 text-slate-600 transition hover:bg-rose-400/10 hover:text-rose-300"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {task.description && (
                        <p className="mt-2 line-clamp-3 whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-500">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="rounded-md border border-violet-300/10 bg-violet-300/[0.07] px-2 py-1 text-[10px] text-violet-200">
                          {CATEGORY_LABELS[task.category]}
                        </span>

                        <span
                          className={`rounded-md border px-2 py-1 text-[10px] ${
                            task.priority === "urgent"
                              ? "border-rose-300/15 bg-rose-300/[0.08] text-rose-300"
                              : task.priority === "high"
                                ? "border-amber-300/15 bg-amber-300/[0.07] text-amber-200"
                                : "border-white/[0.07] text-slate-400"
                          }`}
                        >
                          {PRIORITY_LABELS[task.priority]}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-1.5 text-[11px]">
                        <CalendarDays
                          size={12}
                          className={
                            overdue ? "text-rose-300" : "text-slate-500"
                          }
                        />
                        <span
                          className={
                            overdue ? "text-rose-300" : "text-slate-400"
                          }
                        >
                          {formatDueDate(task.dueDate)}
                          {overdue ? " · Overdue" : ""}
                        </span>
                      </div>

                      {task.repositoryId !== null && (
                        <p className="mt-2 truncate text-[10px] text-slate-500">
                          GitHub repository linked
                        </p>
                      )}

                      <div className="mt-3 border-t border-white/[0.06] pt-3">
                        <label
                          htmlFor={`status-${task.id}`}
                          className="mb-1.5 block text-[10px] text-slate-500"
                        >
                          Move task
                        </label>

                        <div className="relative">
                          <Clock3
                            size={13}
                            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
                          />
                          <select
                            id={`status-${task.id}`}
                            value={task.status}
                            onChange={(event) =>
                              onStatusChange(
                                task.id,
                                event.target.value as TaskStatus,
                              )
                            }
                            className="w-full rounded-md border border-white/[0.07] bg-[#111216] py-2 pl-8 pr-2 text-xs text-slate-300 outline-none focus:border-sky-300/40"
                          >
                            {COLUMNS.map((option) => (
                              <option
                                key={option.status}
                                value={option.status}
                              >
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {columnTasks.length === 0 && (
                  <div className="rounded-lg border border-dashed border-white/[0.08] px-3 py-8 text-center">
                    <p className="text-xs text-slate-500">
                      No tasks here
                    </p>
                    <p className="mt-1 text-[10px] text-slate-600">
                      Tasks will appear when their status matches.
                    </p>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
