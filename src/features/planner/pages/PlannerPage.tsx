import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Columns3,
  Plus,
} from "lucide-react";

import { useGitHubRepositories } from "../../projects/hooks/useGitHubRepositories";
import { usePlannerTasks } from "../hooks/usePlannerTasks";
import { PlannerTaskForm } from "../components/PlannerTaskForm";
import { PlannerTaskList } from "../components/PlannerTaskList";
import { PlannerBoard } from "../components/PlannerBoard";

function toDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getCalendarDays(month: Date): Date[] {
  const firstDay = getMonthStart(month);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const start = new Date(
    firstDay.getFullYear(),
    firstDay.getMonth(),
    1 - startOffset,
  );

  return Array.from({ length: 42 }, (_, index) => {
    return new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + index,
    );
  });
}

export function PlannerPage() {
  const { repositories } = useGitHubRepositories();
  const { tasks, addTask, deleteTask, setTaskStatus } = usePlannerTasks();

  const today = toDateKey(new Date());

  const [visibleMonth, setVisibleMonth] = useState(() =>
    getMonthStart(new Date()),
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [viewMode, setViewMode] = useState<"calendar" | "board">(
  "calendar",
);

  const calendarDays = useMemo(
    () => getCalendarDays(visibleMonth),
    [visibleMonth],
  );

  const tasksByDate = useMemo(() => {
    const grouped = new Map<string, number>();

    for (const task of tasks) {
      grouped.set(task.dueDate, (grouped.get(task.dueDate) ?? 0) + 1);
    }

    return grouped;
  }, [tasks]);

  const selectedTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.dueDate === selectedDate)
        .sort((a, b) => {
          if (a.status === "done" && b.status !== "done") return 1;
          if (a.status !== "done" && b.status === "done") return -1;
          return a.priority.localeCompare(b.priority);
        }),
    [tasks, selectedDate],
  );

  const monthLabel = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(visibleMonth);

  const selectedLabel = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${selectedDate}T00:00:00`));

  const monthTaskCount = tasks.filter((task) => {
    const date = new Date(`${task.dueDate}T00:00:00`);

    return (
      date.getFullYear() === visibleMonth.getFullYear() &&
      date.getMonth() === visibleMonth.getMonth()
    );
  }).length;

  function changeMonth(offset: number) {
    setVisibleMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  }

  function selectDay(date: Date) {
    const key = toDateKey(date);
    setSelectedDate(key);

    if (
      date.getMonth() !== visibleMonth.getMonth() ||
      date.getFullYear() !== visibleMonth.getFullYear()
    ) {
      setVisibleMonth(getMonthStart(date));
    }
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-medium tracking-wide text-sky-300">
            PLAN YOUR NEXT MOVE
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Orbit Planner
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Plan your coding sessions, learning goals, and personal agenda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex rounded-lg border border-white/[0.08] bg-[#141519] p-1">
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              aria-pressed={viewMode === "calendar"}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs transition ${
                viewMode === "calendar"
                  ? "bg-white/[0.08] text-white"
                  : "text-slate-500 hover:text-slate-200"
              }`}
            >
              <CalendarDays size={14} />
              Calendar
            </button>

            <button
              type="button"
              onClick={() => setViewMode("board")}
              aria-pressed={viewMode === "board"}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs transition ${
                viewMode === "board"
                  ? "bg-white/[0.08] text-white"
                  : "text-slate-500 hover:text-slate-200"
              }`}
            >
              <Columns3 size={14} />
              Board
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowTaskForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-400 px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-sky-300"
          >
            <Plus size={15} />
            New task
          </button>
        </div>
      </header>

      {viewMode === "calendar" ? (
        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.75fr)]">
        <section className="rounded-xl border border-white/[0.07] bg-[#141519] p-4 sm:p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">{monthLabel}</h2>
              <p className="mt-1 text-xs text-slate-500">
                {monthTaskCount} scheduled task
                {monthTaskCount === 1 ? "" : "s"} this month
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setVisibleMonth(getMonthStart(new Date()));
                  setSelectedDate(today);
                }}
                className="rounded-lg px-3 py-2 text-[11px] text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                aria-label="Previous month"
                className="rounded-lg border border-white/[0.07] p-2 text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
              >
                <ArrowLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                aria-label="Next month"
                className="rounded-lg border border-white/[0.07] p-2 text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
              >
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
              (day) => (
                <div
                  key={day}
                  className="py-2 text-center text-[10px] font-medium text-slate-500 sm:text-xs"
                >
                  {day}
                </div>
              ),
            )}

            {calendarDays.map((date) => {
              const key = toDateKey(date);
              const isCurrentMonth =
                date.getMonth() === visibleMonth.getMonth() &&
                date.getFullYear() === visibleMonth.getFullYear();
              const isSelected = key === selectedDate;
              const isToday = key === today;
              const taskCount = tasksByDate.get(key) ?? 0;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => selectDay(date)}
                  aria-pressed={isSelected}
                  aria-label={`${key}${taskCount ? `, ${taskCount} tasks` : ""}`}
                  className={`relative flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-lg border text-xs transition sm:min-h-[72px] ${
                    isSelected
                      ? "border-sky-300/40 bg-sky-400/[0.12] text-sky-200"
                      : isToday
                        ? "border-sky-300/20 bg-white/[0.035] text-white"
                        : "border-transparent text-slate-400 hover:border-white/[0.08] hover:bg-white/[0.04]"
                  } ${!isCurrentMonth ? "opacity-35" : ""}`}
                >
                  <span className={isToday ? "font-semibold" : ""}>
                    {date.getDate()}
                  </span>

                  {taskCount > 0 && (
                    <span className="flex items-center gap-1">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isSelected ? "bg-sky-300" : "bg-violet-400"
                        }`}
                      />
                      <span className="text-[9px] text-slate-500">
                        {taskCount}
                      </span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/[0.06] pt-4 text-[10px] text-slate-500">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-300" />
              Selected date
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet-400" />
              Scheduled tasks
            </span>
          </div>
        </section>

        <section className="rounded-xl border border-white/[0.07] bg-[#141519] p-5">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs text-sky-300">
                <CalendarDays size={14} />
                SELECTED DATE
              </p>
              <h2 className="text-base font-semibold text-white">
                {selectedLabel}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {selectedTasks.length} task
                {selectedTasks.length === 1 ? "" : "s"} scheduled
              </p>
            </div>
          </div>

          <PlannerTaskList
            tasks={selectedTasks}
            onStatusChange={setTaskStatus}
            onDelete={deleteTask}
          />

          <button
            type="button"
            onClick={() => setShowTaskForm(true)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/[0.1] px-3 py-3 text-xs font-medium text-slate-400 transition hover:border-sky-300/30 hover:bg-sky-300/[0.04] hover:text-sky-200"
          >
            <Plus size={14} /> Add task to this date
          </button>
        </section>
        </div>
        ) : (
          <PlannerBoard
            tasks={tasks}
            onStatusChange={setTaskStatus}
            onDelete={deleteTask}
          />
        )}

      {showTaskForm && (
        <PlannerTaskForm
          repositories={repositories}
          initialDueDate={selectedDate}
          onSubmit={addTask}
          onClose={() => setShowTaskForm(false)}
        />
      )}
    </div>
  );
}