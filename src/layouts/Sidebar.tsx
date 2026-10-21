import { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Code2,
  Command,
  Database,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LoaderCircle,
  Package,
  Settings2,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGitHubRepositories } from "../features/projects/hooks/useGitHubRepositories";
import type { GitHubRepository } from "../services/github";

type SidebarProps = {
  activeNav: string;
  onNavigate: (name: string) => void;
};

type ProjectGroup = {
  id: string;
  label: string;
  icon: typeof FolderKanban;
  repositories: GitHubRepository[];
};

const CATEGORY_DEFINITIONS = [
  {
    id: "documents",
    label: "Documents & Libraries",
    icon: FileText,
  },
  {
    id: "security",
    label: "Security & Access",
    icon: ShieldCheck,
  },
  {
    id: "developer-tools",
    label: "Developer Tools",
    icon: Terminal,
  },
  {
    id: "web-applications",
    label: "Web Applications",
    icon: Code2,
  },
  {
    id: "data-ml",
    label: "Data & Machine Learning",
    icon: Database,
  },
  {
    id: "other",
    label: "Other Projects",
    icon: Package,
  },
] as const;

function classifyRepository(repository: GitHubRepository): string {
  const searchableText = [
    repository.name,
    repository.description ?? "",
    ...(repository.topics ?? []),
    repository.language ?? "",
  ]
    .join(" ")
    .toLowerCase();

  if (
    /\b(dms|document|archive|arsip|library|perpustakaan|litera)\b/.test(
      searchableText,
    )
  ) {
    return "documents";
  }

  if (
    /\b(rbac|auth|authentication|authorization|security|access-control|permission)\b/.test(
      searchableText,
    )
  ) {
    return "security";
  }

  if (
    /\b(qraft|cli|terminal|developer-tool|devtool|sanitiz|scanner|testing|qa-tool)\b/.test(
      searchableText,
    )
  ) {
    return "developer-tools";
  }

  if (
    /\b(machine-learning|machinelearning|ml|ai|data-science|botaniq|prediction|predictive)\b/.test(
      searchableText,
    )
  ) {
    return "data-ml";
  }

  if (
    /\b(react|vue|website|web-app|web-application|landing-page|frontend|portfolio|travel|dekor)\b/.test(
      searchableText,
    ) ||
    ["JavaScript", "TypeScript", "HTML", "CSS", "Vue"].includes(
      repository.language ?? "",
    )
  ) {
    return "web-applications";
  }

  return "other";
}

function createProjectGroups(
  repositories: GitHubRepository[],
): ProjectGroup[] {
  return CATEGORY_DEFINITIONS.map((category) => ({
    ...category,
    repositories: repositories
      .filter(
        (repository) => classifyRepository(repository) === category.id,
      )
      .sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((group) => group.repositories.length > 0);
}

function getProjectPath(repository: GitHubRepository): string {
  return `/projects/${repository.id}`;
}

function isRepositoryActive(
  pathname: string,
  repository: GitHubRepository,
): boolean {
  const path = pathname.toLowerCase();

  return (
    path === getProjectPath(repository).toLowerCase() ||
    path === `/projects/${repository.name.toLowerCase()}` ||
    path ===
      `/projects/${repository.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}`
  );
}

function getRepositoryInitials(name: string): string {
  const parts = name
    .replace(/[-_.]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

export function Sidebar({ activeNav, onNavigate }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { repositories, loading, error } = useGitHubRepositories();

  const groups = useMemo(
    () => createProjectGroups(repositories),
    [repositories],
  );

  const [expandedGroups, setExpandedGroups] = useState<
    Record<string, boolean>
  >({});

  const activeRepository = repositories.find((repository) =>
    isRepositoryActive(location.pathname, repository),
  );

  function toggleGroup(groupId: string) {
    setExpandedGroups((current) => ({
      ...current,
      [groupId]: !(current[groupId] ?? true),
    }));
  }

  function navigateToRepository(repository: GitHubRepository) {
    navigate(getProjectPath(repository));
  }

  function navigateToDashboard() {
    onNavigate("Overview");
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] flex-col border-r border-white/[0.07] bg-[#101114] md:flex">
      <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-white/[0.07] px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
          <Command size={18} className="text-slate-100" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-wide text-white">
            Orbit
          </p>
          <p className="text-[11px] text-slate-500">Developer workspace</p>
        </div>

        <span className="ml-auto rounded-md border border-white/10 px-1.5 py-0.5 text-[9px] font-medium tracking-wider text-slate-500">
          HUB
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          Workspace
        </p>

        <button
          type="button"
          onClick={navigateToDashboard}
          className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] transition ${
            activeNav === "Overview" && !activeRepository
              ? "border border-white/[0.08] bg-white/[0.07] text-white"
              : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
          }`}
        >
          <LayoutDashboard size={16} className="shrink-0" />
          <span className="flex-1">Overview</span>
          {activeNav === "Overview" && !activeRepository && (
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
          )}
                </button>
                <button
          type="button"
          onClick={() => onNavigate("Planner")}
          className={`group mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] transition ${
            activeNav === "Planner"
              ? "border border-white/[0.08] bg-white/[0.07] text-white"
              : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
          }`}
        >
          <CalendarDays size={16} className="shrink-0" />
          <span className="flex-1">Orbit Planner</span>

          {activeNav === "Planner" && (
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
          )}
        </button>

        <button
          type="button"
          onClick={() => onNavigate("Data Lab")}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] transition ${
            activeNav === "Data Lab"
              ? "border border-accent/10 bg-accent/[0.08] text-accent"
              : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
          }`}
        >
          <Database size={15} />
          <span className="flex-1">Data Lab</span>

          {activeNav === "Data Lab" && (
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          )}
        </button>


        <div className="mb-2 mt-7 flex items-center justify-between px-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
            GitHub projects
          </p>
          <span className="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[10px] tabular-nums text-slate-500">
            {loading ? "…" : repositories.length}
          </span>
        </div>

        {loading && repositories.length === 0 && (
          <div className="flex items-center gap-2 px-3 py-4 text-xs text-slate-500">
            <LoaderCircle size={14} className="animate-spin" />
            <span>Loading repositories…</span>
          </div>
        )}

        {!loading && error && repositories.length === 0 && (
          <div className="mx-2 rounded-lg border border-amber-400/10 bg-amber-400/[0.04] p-3">
            <div className="mb-1 flex items-center gap-2 text-amber-300">
              <AlertCircle size={14} />
              <span className="text-xs font-medium">Sync unavailable</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              GitHub repositories could not be loaded. Check your connection
              and GitHub configuration.
            </p>
          </div>
        )}

        {!loading && !error && repositories.length === 0 && (
          <p className="px-3 py-3 text-xs leading-relaxed text-slate-500">
            No public repositories found for the configured GitHub account.
          </p>
        )}

        <div className="space-y-1">
          {groups.map((group) => {
            const GroupIcon = group.icon;
            const expanded = expandedGroups[group.id] ?? true;
            const containsActiveRepository = group.repositories.some(
              (repository) =>
                isRepositoryActive(location.pathname, repository),
            );

            return (
              <section key={group.id}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={expanded}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
                    containsActiveRepository
                      ? "text-slate-200"
                      : "text-slate-400 hover:bg-white/[0.035] hover:text-slate-200"
                  }`}
                >
                  <GroupIcon size={14} className="shrink-0 text-slate-500" />
                  <span className="min-w-0 flex-1 truncate text-[11px] font-medium">
                    {group.label}
                  </span>
                  <span className="text-[10px] tabular-nums text-slate-600">
                    {group.repositories.length}
                  </span>
                  {expanded ? (
                    <ChevronDown size={13} className="shrink-0 text-slate-600" />
                  ) : (
                    <ChevronRight
                      size={13}
                      className="shrink-0 text-slate-600"
                    />
                  )}
                </button>

                {expanded && (
                  <div className="ml-[18px] mt-1 space-y-0.5 border-l border-white/[0.07] pl-2">
                    {group.repositories.map((repository) => {
                      const isActive = isRepositoryActive(
                        location.pathname,
                        repository,
                      );

                      return (
                        <button
                          key={repository.id}
                          type="button"
                          onClick={() => navigateToRepository(repository)}
                          title={repository.description ?? repository.name}
                          className={`group flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition ${
                            isActive
                              ? "bg-sky-400/[0.09] text-sky-200"
                              : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[9px] font-semibold ${
                              isActive
                                ? "border-sky-300/20 bg-sky-300/10 text-sky-200"
                                : "border-white/[0.06] bg-white/[0.025] text-slate-500 group-hover:text-slate-300"
                            }`}
                          >
                            {getRepositoryInitials(repository.name)}
                          </span>

                          <span className="min-w-0 flex-1 truncate text-[12px]">
                            {repository.name}
                          </span>

                          {isActive && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <div className="mb-2 mt-7 px-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
            Workspace tools
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate("Activity")}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] transition ${
            activeNav === "Activity"
              ? "bg-white/[0.07] text-white"
              : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
          }`}
        >
          <Activity size={15} />
          <span>Activity</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("Settings")}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] transition ${
            activeNav === "Settings"
              ? "bg-white/[0.07] text-white"
              : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
          }`}
        >
          <Settings2 size={15} />
          <span>Settings</span>
        </button>
      </div>

      <div className="shrink-0 border-t border-white/[0.07] p-4">
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
            <Command size={15} className="text-slate-300" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-slate-200">
              GitHub sync
            </p>
            <p className="mt-0.5 truncate text-[10px] text-slate-500">
              {loading
                ? "Fetching repositories"
                : error && repositories.length === 0
                  ? "Connection issue"
                  : `${repositories.length} public repositories`}
            </p>
          </div>

          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              loading
                ? "animate-pulse bg-amber-400"
                : error && repositories.length === 0
                  ? "bg-rose-400"
                  : "bg-emerald-400"
            }`}
          />
        </div>
      </div>
    </aside>
  );
}
