import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  FolderKanban,
  GitFork,
  RefreshCw,
  Star,
} from "lucide-react";

import { useGitHubRepositories } from "../hooks/useGitHubRepositories";
import { ProjectCard } from "../components/ProjectCard";
import { ProjectToolbar } from "../components/ProjectToolbar";

type Props = {
  activeNav: string;
  onNavigate: (name: string) => void;
};

const moduleTitles: Record<string, string> = {
  Tasks: "Tasks",
  Activity: "Activity",
  Settings: "Settings",
  Help: "Help & Feedback",
};

export function ProjectsPage({ activeNav, onNavigate }: Props) {
  const { repositories, loading, error } = useGitHubRepositories();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All languages");
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  // Featured selalu berdasarkan aktivitas terbaru dari GitHub.
  const newestRepositories = useMemo(() => {
    return [...repositories].sort((a, b) => {
      const dateA = new Date(a.pushed_at ?? a.updated_at).getTime();
      const dateB = new Date(b.pushed_at ?? b.updated_at).getTime();

      return dateB - dateA;
    });
  }, [repositories]);

  // Pengurutan All Projects dapat diubah oleh pengguna.
  const sortedRepositories = useMemo(() => {
    return [...newestRepositories].sort((a, b) => {
      const dateA = new Date(a.pushed_at ?? a.updated_at).getTime();
      const dateB = new Date(b.pushed_at ?? b.updated_at).getTime();

      return sortNewestFirst ? dateB - dateA : dateA - dateB;
    });
  }, [newestRepositories, sortNewestFirst]);

  const languageOptions = useMemo(() => {
    const languages = new Set(
      repositories
        .map((repository) => repository.language)
        .filter((language): language is string => Boolean(language)),
    );

    return ["All languages", ...Array.from(languages).sort()];
  }, [repositories]);

  const featuredRepositories = newestRepositories.slice(0, 4);

  const visibleRepositories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sortedRepositories.filter((repository) => {
      const searchableText = [
        repository.name,
        repository.description ?? "",
        repository.language ?? "",
        ...(repository.topics ?? []),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(query);
      const matchesLanguage =
        filter === "All languages" || repository.language === filter;

      return matchesSearch && matchesLanguage;
    });
  }, [sortedRepositories, search, filter]);

  const totalStars = repositories.reduce(
    (total, repository) => total + repository.stargazers_count,
    0,
  );

  const totalForks = repositories.reduce(
    (total, repository) => total + repository.forks_count,
    0,
  );

  const isProjectsPage =
    activeNav === "Projects" || activeNav === "Overview";

  function resetFilters() {
    setSearch("");
    setFilter("All languages");
  }

  if (!isProjectsPage) {
    const moduleTitle = moduleTitles[activeNav] ?? activeNav;

    return (
      <div className="relative flex min-h-[calc(100vh-140px)] items-center justify-center overflow-hidden rounded-[15px] border border-white/[0.06] bg-[#151820] px-6 py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(169,184,255,0.12)_0%,rgba(169,184,255,0.04)_35%,transparent_70%)]"
        />

        <div className="relative z-10 mx-auto flex max-w-lg flex-col items-center text-center">
          <span className="mb-5 rounded-full border border-accent/20 bg-accent/[0.07] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-accent/90">
            Workspace module
          </span>

          <h1 className="font-display text-[28px] font-medium tracking-[-1px] text-slate-100 sm:text-[32px]">
            {moduleTitle}
            <span className="text-accent">.</span>
          </h1>

          <p className="mt-3 max-w-sm text-[12px] leading-[1.8] text-slate-400">
            This module is planned but isn't implemented yet. We're building
            the foundation one module at a time.
          </p>

          <button
            type="button"
            onClick={() => onNavigate("Projects")}
            className="mt-6 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[11px] font-medium text-slate-300 transition hover:border-accent/25 hover:bg-accent/[0.07] hover:text-accent"
          >
            ← Back to overview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Page heading */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.19em] text-accent">
            <span className="h-px w-6 bg-accent" />
            GitHub connected
          </div>

          <h1 className="font-display text-[28px] font-medium tracking-[-1.2px] sm:text-[32px]">
            Your projects<span className="text-accent">.</span>
          </h1>

          <p className="mt-1.5 text-[12px] text-muted">
            Every repository, automatically gathered in one place.
          </p>
        </div>

        <a
          href="https://github.com/Whyuugl?tab=repositories"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-[39px] items-center justify-center gap-2 self-start rounded-[9px] bg-accent px-[15px] text-[11px] font-semibold text-[#22283d] transition hover:-translate-y-px hover:bg-[#c0caff] sm:self-auto"
        >
          View GitHub
          <ArrowUpRight size={15} />
        </a>
      </section>

      {/* Featured hero */}
      <section className="relative isolate min-h-[205px] overflow-hidden rounded-[15px] border border-[#353b50] bg-gradient-to-br from-[#252a3a] via-[#1e212c] to-[#17191f] p-6 sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-24 -z-10 size-64 rounded-full border border-accent/[0.10]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-5 -top-12 -z-10 size-48 rounded-full border border-accent/[0.15]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 right-16 -z-10 size-64 rounded-full bg-accent/[0.06] blur-3xl"
        />

        <div className="relative z-10 max-w-[410px]">
          <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-accent">
            <FolderKanban size={13} />
            Featured repositories
          </div>

          <h2 className="font-display mt-4 text-[25px] font-medium leading-[1.15] tracking-[-1px] sm:text-[28px]">
            Built in public.
            <br />
            Always evolving.
          </h2>

          <p className="mt-3 max-w-sm text-[11px] leading-[1.8] text-slate-400">
            Explore the latest repositories, inspect their technology stacks,
            and see how each project is built.
          </p>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-10 top-1/2 hidden size-36 -translate-y-1/2 items-center justify-center lg:flex"
        >
          <div className="absolute size-36 rounded-full border border-accent/[0.16]" />
          <div className="absolute size-24 rounded-full border border-accent/[0.20]" />
          <div className="absolute size-12 rounded-xl border border-accent/25 bg-accent/[0.08]" />
          <FolderKanban size={24} className="text-accent" />
        </div>
      </section>

      {/* Repository statistics */}
      <section className="grid grid-cols-1 overflow-hidden rounded-xl border border-[#2c303a] bg-[#1b1e25]/65 sm:grid-cols-3">
        {[
          {
            label: "PUBLIC REPOSITORIES",
            value: repositories.length,
            footnote: "Non-fork repositories",
            icon: FolderKanban,
          },
          {
            label: "TOTAL STARS",
            value: totalStars,
            footnote: "Across these repositories",
            icon: Star,
          },
          {
            label: "TOTAL FORKS",
            value: totalForks,
            footnote: "Across these repositories",
            icon: GitFork,
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="min-w-0 border-b border-[#2c303a] p-4 transition last:border-b-0 hover:bg-white/[0.02] sm:border-b-0 sm:border-l sm:first:border-l-0 sm:px-[23px] sm:py-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-semibold tracking-[0.15em] text-muted">
                  {stat.label}
                </p>
                <Icon size={15} className="text-accent/70" />
              </div>

              <p className="font-display mt-2.5 text-[27px] font-medium leading-none tracking-[-0.8px]">
                {loading ? "—" : stat.value.toLocaleString("en")}
              </p>

              <p className="mt-2 text-[10px] text-muted">{stat.footnote}</p>
            </div>
          );
        })}
      </section>

      {/* Loading state */}
      {loading && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-surface p-5 text-sm text-muted"
        >
          <RefreshCw size={16} className="animate-spin text-accent" />
          Fetching your GitHub repositories...
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <section
          role="alert"
          className="rounded-xl border border-red-400/20 bg-red-400/[0.05] p-5"
        >
          <h2 className="text-sm font-semibold text-red-200">
            Could not load repositories
          </h2>

          <p className="mt-2 text-xs leading-6 text-slate-400">{error}</p>

          <p className="mt-2 text-xs text-slate-400">
            Check your internet connection and GitHub API rate limit, then
            reload the page.
          </p>
        </section>
      )}

      {/* Featured projects: always the four newest */}
      {!loading && !error && featuredRepositories.length > 0 && (
        <section>
          <div className="mb-[18px] flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-[19px] font-medium tracking-[-0.5px]">
                Featured projects
              </h2>

              <p className="mt-1 text-[11px] text-muted">
                Your four most recently pushed repositories.
              </p>
            </div>

            <span className="text-[9px] font-semibold tracking-[0.15em] text-muted">
              {featuredRepositories.length} FEATURED
            </span>
          </div>

          <div className="grid grid-cols-1 gap-[13px] lg:grid-cols-2">
            {featuredRepositories.map((repository) => (
              <ProjectCard
                key={repository.id}
                repository={repository}
                featured
              />
            ))}
          </div>
        </section>
      )}

      {/* All projects */}
      <section>
        <div className="mb-[18px] flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-[19px] font-medium tracking-[-0.5px]">
              All projects
            </h2>

            <p className="mt-1 text-[11px] text-muted">
              Browse and filter your public GitHub repositories.
            </p>
          </div>

          <span className="text-[9px] font-semibold tracking-[0.15em] text-muted">
            {loading ? "LOADING" : `${visibleRepositories.length} REPOSITORIES`}
          </span>
        </div>

        {!loading && !error && (
          <>
            <ProjectToolbar
              search={search}
              onSearchChange={setSearch}
              filter={filter}
              onFilterChange={setFilter}
              filterOptions={languageOptions}
              onSort={() => setSortNewestFirst((current) => !current)}
              sortLabel={sortNewestFirst ? "Newest first" : "Oldest first"}
            />

            {visibleRepositories.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-[13px] lg:grid-cols-2">
                {visibleRepositories.map((repository) => (
                  <ProjectCard
                    key={repository.id}
                    repository={repository}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-white/[0.10] px-5 py-12 text-center">
                <div className="flex size-10 items-center justify-center rounded-xl bg-white/[0.04] text-muted">
                  <FolderKanban size={19} />
                </div>

                <h3 className="mt-3 text-[13px] font-medium">
                  No repositories found
                </h3>

                <p className="mt-1.5 text-[11px] text-muted">
                  Try another search or select a different language.
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 rounded-lg border border-white/[0.10] px-3.5 py-2 text-[11px] text-slate-300 transition hover:bg-white/[0.05]"
                >
                  Clear filters
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <footer className="flex flex-col gap-2 border-t border-white/[0.07] pt-4 text-[9px] tracking-[0.08em] text-muted sm:flex-row sm:items-center sm:justify-between">
        <span className="normal-case tracking-normal">
          Made for ideas that deserve to exist.
        </span>

        <span>
          ORBIT WORKSPACE <span className="text-accent">·</span> V0.2
        </span>
      </footer>
    </div>
  );
}