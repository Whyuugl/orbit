
import { ArrowDownRight, ArrowUpRight, GitFork, Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { GitHubRepository } from "../../../services/github";

type Props = {
  repository: GitHubRepository;
  featured?: boolean;
};

function formatDate(date: string | null) {
  if (!date) return "Unknown";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function ProjectCard({ repository, featured = false }: Props) {
  const languages = repository.language ? [repository.language] : [];
  const lastUpdated = formatDate(repository.pushed_at ?? repository.updated_at);

  return (
    <Link
      to={`/projects/${repository.id}`}
      aria-label={`View details for ${repository.name}`}
      className={`group flex min-w-0 flex-col rounded-xl border bg-surface p-4 transition duration-200 hover:-translate-y-px hover:border-accent/30 hover:bg-surface-raised ${
        featured
          ? "border-accent/20"
          : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/[0.09] text-accent ring-1 ring-accent/15">
          <span className="font-display text-lg font-semibold">
            {repository.name.slice(0, 1).toUpperCase()}
          </span>
        </div>

        <ArrowUpRight
          size={16}
          aria-hidden="true"
          className="shrink-0 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
        />
      </div>

      <div className="mt-4 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-display text-sm font-semibold tracking-tight text-slate-100">
            {repository.name}
          </h3>

          {featured && (
            <span className="shrink-0 rounded-md border border-accent/20 bg-accent/[0.07] px-1.5 py-0.5 text-[9px] font-medium text-accent">
              Featured
            </span>
          )}
        </div>

        <p className="mt-2 line-clamp-2 min-h-[38px] text-[11px] leading-[1.7] text-muted">
          {repository.description || "No description provided for this repository."}
        </p>
      </div>

      <div className="mt-3 flex min-h-6 flex-wrap content-start gap-1.5">
        {languages.map((language) => (
          <span
            key={language}
            className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[9px] font-medium text-slate-300"
          >
            {language}
          </span>
        ))}

        {repository.topics.slice(0, 3).map((topic) => (
          <span
            key={topic}
            className="rounded-md border border-white/[0.06] px-2 py-1 text-[9px] text-muted"
          >
            {topic}
          </span>
        ))}

        {languages.length === 0 && repository.topics.length === 0 && (
          <span className="text-[10px] text-muted">No language metadata</span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Star size={13} />
          {repository.stargazers_count}
          <span className="sr-only">stars</span>
        </span>

        <span className="inline-flex items-center gap-1.5">
          <GitFork size={13} />
          {repository.forks_count}
          <span className="sr-only">forks</span>
        </span>

        <span className="ml-auto inline-flex items-center gap-1">
          <ArrowDownRight size={12} />
          Updated {lastUpdated}
        </span>
      </div>
    </Link>
  );
}
