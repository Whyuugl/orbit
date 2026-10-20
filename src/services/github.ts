
const GITHUB_API = "https://api.github.com";
const GITHUB_USERNAME = import.meta.env.VITE_GITHUB_USERNAME ?? "Whyuugl";
const CACHE_DURATION = 5 * 60 * 1000;

export type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  private: boolean;
  fork: boolean;
  archived: boolean;
  updated_at: string;
  pushed_at: string | null;
  created_at: string;
  default_branch: string;
  topics: string[];
  languages_url: string;
  homepage: string | null;
};

export type GitHubLanguage = {
  name: string;
  bytes: number;
  percentage: number;
};

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry<unknown>>();

async function githubFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    if (response.status === 403 || response.status === 429) {
      throw new Error(
        "GitHub API rate limit reached. Please try again later.",
      );
    }

    if (response.status === 404) {
      throw new Error("GitHub resource was not found.");
    }

    throw new Error(`GitHub API request failed (${response.status}).`);
  }

  return (await response.json()) as T;
}

async function cachedFetch<T>(
  key: string,
  loader: () => Promise<T>,
): Promise<T> {
  const existing = cache.get(key) as CacheEntry<T> | undefined;

  if (existing && existing.expiresAt > Date.now()) {
    return existing.value;
  }

  const value = await loader();

  cache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_DURATION,
  });

  return value;
}

export async function fetchPublicRepositories(): Promise<
  GitHubRepository[]
> {
  return cachedFetch("github:public-repositories", async () => {
    const repositories: GitHubRepository[] = [];
    let page = 1;

    while (true) {
      const url = new URL(
        `${GITHUB_API}/users/${encodeURIComponent(GITHUB_USERNAME)}/repos`,
      );

      url.searchParams.set("per_page", "100");
      url.searchParams.set("page", String(page));
      url.searchParams.set("sort", "pushed");
      url.searchParams.set("direction", "desc");
      url.searchParams.set("type", "owner");

      const result = await githubFetch<GitHubRepository[]>(url.toString());

      repositories.push(...result);

      if (result.length < 100) {
        break;
      }

      page += 1;
    }

    return repositories
      .filter((repository) => !repository.private && !repository.fork)
      .sort(
        (a, b) =>
          new Date(b.pushed_at ?? b.updated_at).getTime() -
          new Date(a.pushed_at ?? a.updated_at).getTime(),
      );
  });
}

export async function fetchRepositoryLanguages(
  repository: GitHubRepository,
): Promise<GitHubLanguage[]> {
  return cachedFetch(
    `github:languages:${repository.id}`,
    async () => {
      const data = await githubFetch<Record<string, number>>(
        repository.languages_url,
      );

      const totalBytes = Object.values(data).reduce(
        (total, bytes) => total + bytes,
        0,
      );

      if (totalBytes === 0) {
        return [];
      }

      return Object.entries(data)
        .map(([name, bytes]) => ({
          name,
          bytes,
          percentage: (bytes / totalBytes) * 100,
        }))
        .sort((a, b) => b.bytes - a.bytes);
    },
  );
}
