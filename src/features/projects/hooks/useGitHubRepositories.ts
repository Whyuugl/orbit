import { useEffect, useState } from "react";
import {
  fetchPublicRepositories,
  type GitHubRepository,
} from "../../../services/github";

type UseGitHubRepositoriesResult = {
  repositories: GitHubRepository[];
  loading: boolean;
  error: string | null;
};

export function useGitHubRepositories(): UseGitHubRepositoriesResult {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRepositories() {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchPublicRepositories();

        if (!cancelled) {
          setRepositories(result.filter((repository) => !repository.fork));
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load GitHub repositories.",
          );
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
  }, []);

  return { repositories, loading, error };
}