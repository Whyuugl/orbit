import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Code2,
  FolderGit2,
  GitFork,
  Plus,
  Star,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useGitHubRepositories } from "../../projects/hooks/useGitHubRepositories";
import { usePlannerTasks } from "../hooks/usePlannerTasks";
import { PlannerTaskForm } from "../components/PlannerTaskForm";
import { PlannerTaskList } from "../components/PlannerTaskList";

function getToday(): string {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 11) return "Good morning";
  if (hour < 15) return "Good afternoon";
  if (hour < 19) return "Good evening";
  return "Working late";
}

export function DashboardOverviewPage() {
  const navigate = useNavigate();
  const { repositories, loading, error } = useGitHubRepositories();
  const { tasks, addTask, deleteTask, setTaskStatus } = usePlannerTasks();

  const [showTaskForm, setShowTaskForm] = useState(false);

  const today = getToday();

  const pendingTasks = useMemo(
    () => tasks.filter((task) => task.status !== "done"),
    [tasks],
  );

  const completedTasks = tasks.filter((task) => task.status === "done");

  const upcomingTasks = useMemo(
    () =>
      [...pendingTasks]
        .filter((task) => task.dueDate >= today)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 5),
    [pendingTasks, today],
  );

  const overdueCount = pendingTasks.filter(
    (task) => task.dueDate < today,
  ).length;

  const totalStars = repositories.reduce(
    (total, repository) => total + repository.stargazers_count,
    0,
  );

  const totalForks = repositories.reduce(
    (total, repository) => total + repository.forks_count,
    0,
  );

  const completionRate =
    tasks.length > 0
      ? Math.round((completedTasks.length / tasks.length) * 100)
      : 0;

  const stats = [
    {
      label: "Public repositories",
      value: loading ? "…" : error && repositories.length === 0
        ? "—"
        : repositories.length.toLocaleString(),
      detail: "Connected to GitHub",
      icon: FolderGit2,
    },
    {
      label: "GitHub stars",
      value: loading && repositories.length === 0
        ? "…"
        : totalStars.toLocaleString(),
      detail: "Across loaded repositories",
      icon: Star,
    },
    {
      label: "Open tasks",
      value: pendingTasks.length.toLocaleString(),
      detail: overdueCount > 0 ? `${overdueCount} overdue` : "You're on track",
      icon: Target,
    },
    {
      label: "Completed tasks",
      value: `${completionRate}%`,
      detail: `${completedTasks.length} of ${tasks.length} completed`,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-medium tracking-wide text-sky-300">
            YOUR WORKSPACE
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {getGreeting()}.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
            One place for your projects, learning goals, and everything you're
            planning to build.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate("/planner")}
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.09] bg-white/[0.035] px-3.5 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
          >
            <CalendarDays size={15} />
            Open planner
          </button>

          <button
            type="button"
            onClick={() => setShowTaskForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-400 px-3.5 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-sky-300"
          >
            <Plus size={15} />
            New task
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="rounded-xl border border-white/[0.07] bg-[#141519] p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">{stat.label}</p>
                <Icon size={16} className="text-sky-300" />
              </div>
              <p className="mt-4 text-2xl font-semibold tracking-tight text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">{stat.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.8fr)]">
        <article className="rounded-xl border border-white/[0.07] bg-[#141519] p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Upcoming tasks</h2>
              <p className="mt-1 text-xs text-slate-500">
                Your next priorities, in deadline order.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/planner")}
              className="inline-flex shrink-0 items-center gap-1.5 text-xs text-sky-300 transition hover:text-sky-200"
            >
              View planner <ArrowRight size={13} />
            </button>
          </div>

          <PlannerTaskList
            tasks={upcomingTasks}
            onStatusChange={setTaskStatus}
            onDelete={deleteTask}
            compact
          />

          {overdueCount > 0 && (
            <p className="mt-4 rounded-lg border border-rose-400/10 bg-rose-400/[0.04] px-3 py-2 text-xs text-rose-300">
              You have {overdueCount} overdue task
              {overdueCount === 1 ? "" : "s"}. Review your schedule in Planner.
            </p>
          )}
        </article>

        <article className="rounded-xl border border-white/[0.07] bg-[#141519] p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-white">Project pulse</h2>
            <p className="mt-1 text-xs text-slate-500">
              A snapshot of your GitHub workspace.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-400/[0.08]">
                <Code2 size={17} className="text-sky-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-200">
                  Repository activity
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {loading
                    ? "Loading GitHub data…"
                    : error && repositories.length === 0
                      ? "GitHub data is unavailable"
                      : `${repositories.length} public repositories loaded`}
                </p>
              </div>
              <span
                className={`h-2 w-2 rounded-full ${
                  loading
                    ? "animate-pulse bg-amber-300"
                    : error && repositories.length === 0
                      ? "bg-rose-400"
                      : "bg-emerald-400"
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/[0.06] p-3">
                <Star size={14} className="mb-3 text-amber-300" />
                <p className="text-lg font-semibold text-white">
                  {totalStars.toLocaleString()}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">Total stars</p>
              </div>
              <div className="rounded-lg border border-white/[0.06] p-3">
                <GitFork size={14} className="mb-3 text-violet-300" />
                <p className="text-lg font-semibold text-white">
                  {totalForks.toLocaleString()}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">Total forks</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="flex w-full items-center justify-between rounded-lg border border-white/[0.07] px-3.5 py-3 text-xs font-medium text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
            >
              Explore all projects <ArrowRight size={14} />
            </button>
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-white/[0.07] bg-[#141519] p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">All open tasks</h2>
            <p className="mt-1 text-xs text-slate-500">
              Tasks still in progress or waiting to start.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowTaskForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-2 text-xs text-slate-300 transition hover:bg-white/[0.05]"
          >
            <Plus size={13} /> Add
          </button>
        </div>

        <PlannerTaskList
          tasks={pendingTasks}
          onStatusChange={setTaskStatus}
          onDelete={deleteTask}
        />
      </section>

      {showTaskForm && (
        <PlannerTaskForm
          repositories={repositories}
          onSubmit={addTask}
          onClose={() => setShowTaskForm(false)}
        />
      )}
    </div>
  );
}