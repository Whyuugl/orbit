
import { useEffect, useState } from "react";
import { Code2, ExternalLink, RefreshCw } from "lucide-react";

import {
  fetchPublicRepositories,
  type GitHubRepository,
} from "../../../services/github";

type RepositorySelectorProps = {
  projectKey: string;
  projectName: string;
  onRepositoryChange: (repository: GitHubRepository | null) => void;
};

const STORAGE_KEY = "orbit.github.repository-assignments";

function readAssignments(): Record<string, number> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return {};
    }

    const parsed: unknown = JSON.parse(stored);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    return parsed as Record<string, number>;
  } catch {
    return {};
  }
}

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getSuggestedRepository(
  repositories: GitHubRepository[],
  projectName: string,
): GitHubRepository | null {
  const normalizedProject = normalizeName(projectName);

  if (!normalizedProject) {
    return null;
  }

  const exactMatch = repositories.find(
    (repository) =>
      normalizeName(repository.name) === normalizedProject,
  );

  if (exactMatch) {
    return exactMatch;
  }

  return (
    repositories.find((repository) => {
      const normalizedRepository = normalizeName(repository.name);

      return (
        normalizedRepository.length > 0 &&
        (normalizedRepository.includes(normalizedProject) ||
          normalizedProject.includes(normalizedRepository))
      );
    }) ?? null
  );
}

export function RepositorySelector({
  projectKey,
  projectName,
  onRepositoryChange,
}: RepositorySelectorProps) {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadRepositories() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchPublicRepositories();

        if (cancelled) {
          return;
        }

        const availableRepositories = result.filter(
          (repository) => !repository.fork,
        );

        setRepositories(availableRepositories);

        const assignments = readAssignments();
        const savedId = assignments[projectKey];

        const savedRepository = availableRepositories.find(
          (repository) => repository.id === savedId,
        );

        const suggestedRepository = getSuggestedRepository(
          availableRepositories,
          projectName,
        );

        const initialRepository =
          savedRepository ?? suggestedRepository;

        setSelectedId(
          initialRepository ? String(initialRepository.id) : "",
        );

        onRepositoryChange(initialRepository ?? null);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load GitHub repositories.",
          );
          setRepositories([]);
          setSelectedId("");
          onRepositoryChange(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadRepositories();

    return () => {
      cancelled = true;
    };
  }, [projectKey, projectName, onRepositoryChange, retryKey]);

  function handleChange(repositoryId: string) {
    setSelectedId(repositoryId);

    const repository =
      repositories.find(
        (item) => String(item.id) === repositoryId,
      ) ?? null;

    try {
      const assignments = readAssignments();

      if (repository) {
        assignments[projectKey] = repository.id;
      } else {
        delete assignments[projectKey];
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(assignments),
      );
    } catch {
      // Repository selection still works if local storage is unavailable.
    }

    onRepositoryChange(repository);
  }

  const selectedRepository =
    repositories.find(
      (repository) => String(repository.id) === selectedId,
    ) ?? null;

  return (
    <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
            GitHub integration
          </p>

          <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-100">
            Connected repository
          </h2>

          <p className="mt-1.5 text-xs leading-6 text-muted">
            Select the GitHub repository associated with{" "}
            <span className="text-slate-300">{projectName}</span>.
          </p>
        </div>

        <Code2
          size={19}
          className="shrink-0 text-slate-300"
          aria-hidden="true"
        />
      </div>

      <div className="mt-5">
        <label
          htmlFor={`repository-${projectKey}`}
          className="mb-2 block text-xs font-medium text-slate-300"
        >
          Repository
        </label>

        {loading ? (
          <div
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-3 text-xs text-muted"
            role="status"
          >
            <RefreshCw size={13} className="animate-spin" />
            Loading your repositories...
          </div>
        ) : error ? (
          <div
            className="rounded-lg border border-amber-400/20 bg-amber-400/[0.04] p-3"
            role="alert"
          >
            <p className="text-xs leading-5 text-amber-200">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="mt-2 text-xs text-slate-200 underline underline-offset-4 transition hover:text-white"
            >
              Try again
            </button>
          </div>
        ) : (
          <select
            id={`repository-${projectKey}`}
            value={selectedId}
            onChange={(event) => handleChange(event.target.value)}
            className="w-full rounded-lg border border-border bg-[#151923] px-3 py-3 text-xs text-slate-200 outline-none transition focus:border-violet-400/50"
          >
            <option value="">No repository connected</option>

            {repositories.map((repository) => (
              <option
                key={repository.id}
                value={String(repository.id)}
              >
                {repository.name}
                {repository.language
                  ? ` · ${repository.language}`
                  : ""}
              </option>
            ))}
          </select>
        )}
      </div>

      {!loading && !error && (
        <p className="mt-2 text-[10px] text-muted">
          {repositories.length} public repositories available
        </p>
      )}

      {selectedRepository && !loading && !error && (
        <div className="mt-4 rounded-lg border border-border bg-white/[0.02] p-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="break-words text-xs font-medium text-slate-200">
                {selectedRepository.full_name}
              </p>

              <p className="mt-1 text-[10px] text-muted">
                {selectedRepository.language ?? "Language not specified"}
                {" · "}
                {selectedRepository.stargazers_count} stars
                {" · "}
                {selectedRepository.forks_count} forks
              </p>
            </div>

            <a
              href={selectedRepository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${selectedRepository.full_name} on GitHub`}
              className="inline-flex shrink-0 items-center gap-1.5 text-xs text-violet-300 transition hover:text-violet-200"
            >
              Open
              <ExternalLink size={12} aria-hidden="true" />
            </a>
          </div>

          {selectedRepository.description && (
            <p className="mt-3 text-xs leading-5 text-muted">
              {selectedRepository.description}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
