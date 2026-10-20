
import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Code2,
  ExternalLink,
  GitFork,
  Layers3,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  fetchRepositoryLanguages,
  type GitHubLanguage,
  type GitHubRepository,
} from "../../../services/github";
import { useGitHubRepositories } from "../hooks/useGitHubRepositories";

type ProjectContent = {
  tagline: string;
  overview: string;
  problem: string;
  solution: string;
  features: { title: string; description: string }[];
  workflow: string[];
  engineeringNotes: { title: string; rationale: string }[];
};

const knownProjectContent: Record<string, ProjectContent> = {
  qraft: {
    tagline: "Quality assurance, closer to the developer workflow.",
    overview:
      "Qraft CLI is a developer-focused command-line toolkit for project discovery, QA analysis, test workflows, and readable quality reports.",
    problem:
      "Preparing quality assurance checks manually can be repetitive. Developers need a structured way to discover project configuration, identify important test scenarios, and understand failures.",
    solution:
      "Qraft is designed around modular responsibilities for project discovery, QA analysis, test execution, and reporting.",
    features: [
      {
        title: "Project discovery",
        description:
          "Inspect project structure and configuration before running quality checks.",
      },
      {
        title: "QA analysis",
        description:
          "Organize validation scenarios, edge cases, and potential testing gaps.",
      },
      {
        title: "Test workflows",
        description:
          "Build a consistent workflow for different kinds of quality checks.",
      },
      {
        title: "Readable reports",
        description:
          "Present results in a format developers can understand and act on.",
      },
    ],
    workflow: ["CLI", "Project Scanner", "QA Analyzer", "Test Runner", "Reporter"],
    engineeringNotes: [
      {
        title: "Separation of responsibilities",
        rationale:
          "Keep discovery, analysis, execution, and reporting independently maintainable.",
      },
      {
        title: "Actionable results",
        rationale:
          "Explain failures clearly without exposing secrets or sensitive configuration values.",
      },
      {
        title: "Predictable behavior",
        rationale:
          "Handle invalid configuration, missing files, and failed checks consistently.",
      },
    ],
  },
  litera: {
    tagline: "A more thoughtful way to learn through reading.",
    overview:
      "Litera explores a digital library experience focused on book discovery, educational reading, and learning-oriented features.",
    problem:
      "A digital library can become little more than a catalogue when it offers limited support for comprehension and learning activities.",
    solution:
      "The concept brings library management and learning features together while keeping member and administrator responsibilities distinct.",
    features: [
      {
        title: "Digital library",
        description:
          "Organize books and make educational resources easier to discover.",
      },
      {
        title: "Reading experience",
        description:
          "Provide a focused interface for accessing and exploring reading material.",
      },
      {
        title: "Learning summaries",
        description:
          "Support comprehension with concise summaries where implemented.",
      },
      {
        title: "Chapter quizzes",
        description:
          "Reinforce learning with knowledge checks associated with chapters.",
      },
    ],
    workflow: ["Discover", "Library", "Read", "Knowledge Check", "Progress"],
    engineeringNotes: [
      {
        title: "Learning-oriented design",
        rationale:
          "Treat learning activities as part of the experience rather than focusing only on book listings.",
      },
      {
        title: "Role-aware capabilities",
        rationale:
          "Keep member and administrator responsibilities distinct.",
      },
      {
        title: "Maintainable structure",
        rationale:
          "Separate interface components, business rules, and data access as the project grows.",
      },
    ],
  },
  rbac: {
    tagline: "Making access control easier to inspect and audit.",
    overview:
      "RBAC Audit focuses on role-based access management and organizing authorization-related application activity.",
    problem:
      "As an application grows, access rules can become difficult to inspect. Developers need a clear way to reason about roles, permissions, and protected resources.",
    solution:
      "The project explores explicit authorization rules and structured audit records to make important application activity easier to review.",
    features: [
      {
        title: "Role management",
        description:
          "Organize user roles and the responsibilities associated with them.",
      },
      {
        title: "Permission visibility",
        description:
          "Make permission relationships easier to understand and review.",
      },
      {
        title: "Access control",
        description:
          "Represent authorization checks for protected resources.",
      },
      {
        title: "Audit records",
        description:
          "Structure activity records for later inspection.",
      },
    ],
    workflow: ["User", "Role", "Permission", "Policy Check", "Audit Log"],
    engineeringNotes: [
      {
        title: "Explicit authorization",
        rationale:
          "Enforce authorization on protected server operations, not only by hiding interface elements.",
      },
      {
        title: "Consistent data access",
        rationale:
          "Use a structured data-access layer to make database operations easier to reason about.",
      },
      {
        title: "Auditable activity",
        rationale:
          "Capture useful context without storing passwords, tokens, or other sensitive values in logs.",
      },
    ],
  },
  dekor: {
    tagline: "A considered storefront for furniture and interiors.",
    overview:
      "Dekor is a furniture storefront concept focused on product presentation, visual hierarchy, and a responsive browsing experience.",
    problem:
      "Furniture storefronts need to communicate product character without overwhelming visitors with excessive interface elements.",
    solution:
      "Use focused product presentation, consistent spacing, and reusable responsive components.",
    features: [
      {
        title: "Product presentation",
        description:
          "Give furniture and interior products room to stand out visually.",
      },
      {
        title: "Visual hierarchy",
        description:
          "Organize content so visitors can understand the page at a glance.",
      },
      {
        title: "Responsive layout",
        description:
          "Adapt the storefront to different screen sizes.",
      },
      {
        title: "Reusable interface",
        description:
          "Keep spacing and common interface patterns consistent.",
      },
    ],
    workflow: ["Storefront", "Collections", "Product Display", "Responsive UI"],
    engineeringNotes: [
      {
        title: "Responsive-first layout",
        rationale:
          "Keep layout patterns readable and usable across desktop, tablet, and mobile.",
      },
      {
        title: "Visual hierarchy",
        rationale:
          "Prioritize product imagery, meaningful headings, and clear calls to action.",
      },
      {
        title: "Reusable components",
        rationale:
          "Keep styling and interface behavior consistent as the storefront grows.",
      },
    ],
  },
  dms: {
    tagline: "A structured workspace for document management.",
    overview:
      "This project explores organizing documents, managing lifecycle states, and making document activity easier to follow.",
    problem:
      "As document collections grow, finding files and understanding their current state can become difficult.",
    solution:
      "Structure document operations around metadata, lifecycle rules, access control, and activity history.",
    features: [
      {
        title: "Document organization",
        description:
          "Structure document metadata so files are easier to find.",
      },
      {
        title: "Document lifecycle",
        description:
          "Define permitted document states and transitions.",
      },
      {
        title: "Access management",
        description:
          "Organize document permissions around user responsibilities.",
      },
      {
        title: "Activity history",
        description:
          "Make document-related activities easier to review.",
      },
    ],
    workflow: ["User", "Document", "Metadata", "Lifecycle", "Activity Log"],
    engineeringNotes: [
      {
        title: "Document lifecycle",
        rationale:
          "Define permitted state transitions explicitly so invalid changes can be rejected.",
      },
      {
        title: "Authorization and file security",
        rationale:
          "Check permissions on the server for document operations and file downloads.",
      },
      {
        title: "Data integrity",
        rationale:
          "Keep document metadata, file references, and activity records consistent.",
      },
    ],
  },
};

const accentStyles = [
  {
    text: "text-violet-300",
    border: "border-violet-400/20",
    background: "bg-violet-400/10",
    glow: "bg-violet-500/10",
  },
  {
    text: "text-blue-300",
    border: "border-blue-400/20",
    background: "bg-blue-400/10",
    glow: "bg-blue-500/10",
  },
  {
    text: "text-emerald-300",
    border: "border-emerald-400/20",
    background: "bg-emerald-400/10",
    glow: "bg-emerald-500/10",
  },
  {
    text: "text-orange-300",
    border: "border-orange-400/20",
    background: "bg-orange-400/10",
    glow: "bg-orange-500/10",
  },
] as const;

const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#d9b83f",
  CSS: "#8b5cf6",
  HTML: "#e87545",
  Python: "#4b9bd5",
  PHP: "#858fbd",
  Vue: "#42b883",
  Shell: "#89b85c",
  Go: "#57b6c9",
  Rust: "#ce8055",
  SCSS: "#c6538c",
  Java: "#e76f00",
  Kotlin: "#a97bff",
  Dart: "#00b4ab",
  SQL: "#e38c00",
};

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getProjectContent(repository: GitHubRepository): ProjectContent {
  const name = normalizeName(repository.name);

  if (name.includes("qraft")) return knownProjectContent.qraft;
  if (name === "litera") return knownProjectContent.litera;
  if (name.includes("rbac")) return knownProjectContent.rbac;
  if (name === "dekor") return knownProjectContent.dekor;
  if (name.includes("document-management") || name.includes("dms")) {
    return knownProjectContent.dms;
  }

  const description =
    repository.description?.trim() ||
    "This repository does not have a public description yet.";

  const mainLanguage = repository.language;

  return {
    tagline: description,
    overview: description,
    problem:
      "The specific problem this project addresses has not been documented in its GitHub description. Review the repository README and source code for more context.",
    solution:
      "The implementation details are best understood by examining the repository source code, documentation, and commit history.",
    features: [
      {
        title: "Repository overview",
        description:
          "Explore the source code, project structure, and documentation in the GitHub repository.",
      },
      {
        title: "Technology stack",
        description: mainLanguage
          ? `GitHub identifies ${mainLanguage} as this repository's primary language.`
          : "GitHub has not reported a primary programming language for this repository.",
      },
      {
        title: "Development activity",
        description:
          "Use the repository's commit history to understand how the project has evolved.",
      },
      {
        title: "Project documentation",
        description:
          "Consult the README and repository files to verify features and implementation details.",
      },
    ],
    workflow: [
      "Repository",
      "Source Code",
      "Implementation",
      "Verification",
    ],
    engineeringNotes: [
      {
        title: "Verify implementation",
        rationale:
          "Features and architecture are not inferred from the repository name alone. Confirm them from source code and documentation.",
      },
      {
        title: "Use repository metadata",
        rationale:
          "Language, stars, forks, and activity dates are read from GitHub rather than manually estimated.",
      },
      {
        title: "Keep documentation current",
        rationale:
          "A clear README helps contributors understand project goals, setup instructions, and implementation decisions.",
      },
    ],
  };
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-100">
        {title}
      </h2>
      {description && (
        <p className="mt-1.5 max-w-2xl text-xs leading-6 text-muted">
          {description}
        </p>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-5" aria-label="Loading project">
      <div className="h-6 w-36 animate-pulse rounded bg-white/[0.08]" />
      <div className="h-44 animate-pulse rounded-2xl border border-border bg-surface" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-32 animate-pulse rounded-xl bg-surface" />
        <div className="h-32 animate-pulse rounded-xl bg-surface" />
      </div>
    </div>
  );
}

function NotFound({ message }: { message: string }) {
  const navigate = useNavigate();

  return (
    <section className="rounded-2xl border border-border bg-surface p-7 sm:p-9">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">
        Workspace / Project
      </p>
      <h1 className="mt-4 text-2xl font-semibold text-slate-100">
        Project not found
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted">{message}</p>
      <button
        type="button"
        onClick={() => navigate("/projects")}
        className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/[0.04]"
      >
        <ArrowLeft size={15} />
        Back to projects
      </button>
    </section>
  );
}

function LanguageStats({ repository }: { repository: GitHubRepository }) {
  const [languages, setLanguages] = useState<GitHubLanguage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLanguages() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchRepositoryLanguages(repository);

        if (!cancelled) setLanguages(result);
      } catch (err: unknown) {
        if (!cancelled) {
          setLanguages([]);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load language statistics.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadLanguages();

    return () => {
      cancelled = true;
    };
  }, [repository]);

  return (
    <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
            Repository analytics
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-100">
            Language composition
          </h2>
          <p className="mt-1.5 text-xs leading-6 text-muted">
            Code language breakdown reported by GitHub.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2.5 py-1 text-[10px] text-emerald-300">
          <span className="size-1.5 rounded-full bg-emerald-300" />
          GitHub API
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-white/[0.02] px-3 py-2.5">
        <span className="truncate text-xs text-slate-300">
          {repository.full_name}
        </span>
        <a
          href={repository.html_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-[10px] text-violet-300 hover:text-violet-200"
        >
          Source
          <ExternalLink size={11} />
        </a>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-5" aria-label="Loading language statistics">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="animate-pulse space-y-2">
                <div className="h-3 w-1/3 rounded bg-white/[0.08]" />
                <div className="h-2 rounded-full bg-white/[0.06]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            className="rounded-lg border border-amber-400/15 bg-amber-400/[0.04] p-4"
            role="alert"
          >
            <p className="text-xs font-medium text-amber-200">
              Statistics unavailable
            </p>
            <p className="mt-1 text-xs leading-5 text-muted">{error}</p>
          </div>
        ) : languages.length === 0 ? (
          <p className="text-xs leading-6 text-muted">
            GitHub has no language statistics available for this repository.
          </p>
        ) : (
          <div className="space-y-5">
            {languages.map((language) => (
              <div key={language.name} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          languageColors[language.name] ?? "#94a3b8",
                      }}
                      aria-hidden="true"
                    />
                    <span className="truncate text-xs font-medium text-slate-200">
                      {language.name}
                    </span>
                  </div>
                  <span className="shrink-0 font-mono text-xs tabular-nums text-slate-300">
                    {language.percentage.toFixed(1)}%
                  </span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-white/[0.06]"
                  role="progressbar"
                  aria-label={`${language.name} composition`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Number(language.percentage.toFixed(1))}
                >
                  <div
                    className="h-full rounded-full transition-[width] duration-700"
                    style={{
                      width: `${language.percentage}%`,
                      backgroundColor:
                        languageColors[language.name] ?? "#94a3b8",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-5 border-t border-border pt-4 text-[10px] leading-5 text-muted">
        Percentages represent GitHub's language breakdown by code bytes. They
        do not represent project completion or feature usage.
      </p>
    </section>
  );
}

function ProjectFeatures({
  features,
  accent,
}: {
  features: ProjectContent["features"];
  accent: (typeof accentStyles)[number];
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
      <SectionHeading
        eyebrow="Capabilities"
        title="Project highlights"
        description="An overview of this project's purpose and key areas."
      />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {features.map((feature, index) => (
          <article
            key={feature.title}
            className="group rounded-xl border border-border bg-white/[0.015] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-white/[0.03]"
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className={`flex size-8 items-center justify-center rounded-lg border text-[10px] font-semibold ${accent.border} ${accent.background} ${accent.text}`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <ArrowUpRight
                size={14}
                className="text-muted opacity-0 transition group-hover:opacity-100"
              />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-200">
              {feature.title}
            </h3>
            <p className="mt-2 text-xs leading-6 text-muted">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function EngineeringDecisions({
  notes,
  accent,
}: {
  notes: ProjectContent["engineeringNotes"];
  accent: (typeof accentStyles)[number];
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
      <SectionHeading
        eyebrow="Engineering notes"
        title="Technical considerations"
        description="Important engineering principles to consider while building and maintaining the project."
      />
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {notes.map((note, index) => (
          <article
            key={note.title}
            className="flex gap-4 rounded-xl border border-border bg-white/[0.015] p-4 transition-colors hover:bg-white/[0.035]"
          >
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg border ${accent.border} ${accent.background} ${accent.text}`}
            >
              <span className="font-mono text-xs">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-slate-100">
                {note.title}
              </h3>
              <p className="mt-2 text-xs leading-6 text-muted">
                {note.rationale}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function WorkflowArchitecture({
  workflow,
  projectName,
  accent,
}: {
  workflow: string[];
  projectName: string;
  accent: (typeof accentStyles)[number];
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="p-5 sm:p-6">
        <SectionHeading
          eyebrow="Project structure"
          title="Workflow overview"
          description="A conceptual flow for understanding the project's major steps, not a claim about its actual runtime architecture."
        />
        <div className="mt-6 hidden items-center gap-2 md:flex">
          {workflow.map((step, index) => (
            <div
              key={step}
              className="flex min-w-0 flex-1 items-center gap-2"
            >
              <div
                className={`flex min-h-[76px] min-w-0 flex-1 flex-col justify-center rounded-xl border px-3 py-3 ${accent.border} ${accent.background}`}
              >
                <span className={`text-[9px] ${accent.text}`}>
                  STEP {String(index + 1).padStart(2, "0")}
                </span>
                <span className="mt-2 break-words text-xs font-medium text-slate-200">
                  {step}
                </span>
              </div>
              {index < workflow.length - 1 && (
                <ArrowRight
                  size={14}
                  className="shrink-0 text-muted"
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-2 md:hidden">
          {workflow.map((step, index) => (
            <div key={step}>
              <div
                className={`flex items-center gap-3 rounded-lg border p-3 ${accent.border} ${accent.background}`}
              >
                <span className={`text-[10px] ${accent.text}`}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-xs font-medium text-slate-200">
                  {step}
                </span>
              </div>
              {index < workflow.length - 1 && (
                <ArrowDownRight size={14} className="my-1 ml-4 text-muted" />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2 text-[10px] text-muted">
          <Layers3 size={13} />
          <span>Conceptual workflow overview</span>
        </div>
        <span className={`text-[10px] ${accent.text}`}>{projectName}</span>
      </div>
    </section>
  );
}

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { repositories, loading, error } = useGitHubRepositories();

  const repository = repositories.find(
    (item) =>
      String(item.id) === projectId ||
      item.name.toLowerCase() === projectId?.toLowerCase() ||
      normalizeName(item.name) === projectId?.toLowerCase(),
  );

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <NotFound
        message={`Unable to load GitHub repositories: ${error}. Check your connection and try again.`}
      />
    );
  }

  if (!repository) {
    return (
      <NotFound message="This repository was not found in the public repositories loaded from GitHub. Return to the projects page and select a repository." />
    );
  }

  const content = getProjectContent(repository);
  const accent =
    accentStyles[repository.id % accentStyles.length] ?? accentStyles[0];

  const updatedDate = repository.pushed_at ?? repository.updated_at;
  const formattedDate = updatedDate
    ? new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(updatedDate))
    : "Unknown";

  const technologies = repository.topics ?? [];

  return (
    <div className="mx-auto max-w-[1200px] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/projects")}
          className="group inline-flex items-center gap-2 text-xs text-muted transition hover:text-slate-100"
        >
          <ArrowLeft
            size={14}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          Back to projects
        </button>
        <div className="flex items-center gap-2 text-[10px] text-muted">
          <span>Workspace</span>
          <ArrowRight size={11} />
          <span>Projects</span>
          <ArrowRight size={11} />
          <span className={accent.text}>{repository.name}</span>
        </div>
      </div>

      <section className="relative isolate overflow-hidden rounded-2xl border border-border bg-surface">
        <div
          className={`pointer-events-none absolute -right-24 -top-32 -z-10 size-80 rounded-full blur-3xl ${accent.glow}`}
        />
        <div
          className={`pointer-events-none absolute -bottom-40 left-1/3 -z-10 size-72 rounded-full blur-3xl ${accent.glow}`}
        />

        <div className="p-5 sm:p-8 lg:p-9">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] ${accent.border} ${accent.background} ${accent.text}`}
            >
              <Code2 size={12} />
              {repository.language ?? "Language not specified"}
            </span>
            {repository.archived && (
              <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[10px] text-amber-200">
                Archived
              </span>
            )}
            {repository.private && (
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-slate-300">
                Private
              </span>
            )}
          </div>

          <div className="mt-7 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div
                className={`flex size-12 items-center justify-center rounded-xl border ${accent.border} ${accent.background} ${accent.text}`}
              >
                <Code2 size={23} strokeWidth={1.7} />
              </div>

              <p
                className={`mt-5 text-[10px] font-medium uppercase tracking-[0.22em] ${accent.text}`}
              >
                GitHub repository
              </p>

              <h1 className="mt-2 break-words text-3xl font-semibold tracking-[-0.04em] text-slate-50 sm:text-4xl lg:text-[42px]">
                {repository.name}
                <span className={`ml-1 ${accent.text}`}>.</span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-[15px]">
                {content.tagline}
              </p>

              <p className="mt-3 max-w-2xl text-xs leading-7 text-muted sm:text-sm">
                {content.overview}
              </p>

              {technologies.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {technologies.map((technology) => (
                    <span
                      key={technology}
                      className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.025] px-2.5 py-1.5 text-[10px] font-medium text-slate-300"
                    >
                      <Code2 size={12} className="text-muted" />
                      {technology}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap gap-2 lg:max-w-[220px] lg:flex-col">
              <a
                href={repository.html_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-white"
              >
                View repository
                <ArrowUpRight size={14} />
              </a>

              {repository.homepage ? (
                <a
                  href={repository.homepage}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-white/[0.02] px-4 py-2.5 text-xs font-medium text-slate-200 transition hover:bg-white/[0.06]"
                >
                  Live demo
                  <ExternalLink size={13} />
                </a>
              ) : (
                <span className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-white/[0.02] px-4 py-2.5 text-xs text-muted">
                  <ExternalLink size={13} />
                  No demo configured
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 border-t border-border sm:grid-cols-4">
          <div className="border-r border-border px-5 py-4 sm:px-7">
            <p className="text-[10px] text-muted">Stars</p>
            <div className="mt-2 flex items-center gap-2">
              <Star size={15} className="text-amber-300" />
              <span className="text-xl font-semibold tabular-nums text-slate-100">
                {repository.stargazers_count}
              </span>
            </div>
          </div>

          <div className="border-r border-border px-5 py-4 sm:px-7">
            <p className="text-[10px] text-muted">Forks</p>
            <div className="mt-2 flex items-center gap-2">
              <GitFork size={15} className="text-slate-400" />
              <span className="text-xl font-semibold tabular-nums text-slate-100">
                {repository.forks_count}
              </span>
            </div>
          </div>

          <div className="border-r border-border px-5 py-4 sm:px-7">
            <p className="text-[10px] text-muted">Primary language</p>
            <div className="mt-2 flex items-center gap-2">
              <Code2 size={15} className={accent.text} />
              <span className="truncate text-sm font-semibold text-slate-100">
                {repository.language ?? "Not specified"}
              </span>
            </div>
          </div>

          <div className="col-span-2 px-5 py-4 sm:col-span-1 sm:px-7">
            <p className="text-[10px] text-muted">Last pushed</p>
            <div className="mt-2 flex items-center gap-2">
              <CalendarDays size={15} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-100">
                {formattedDate}
              </span>
            </div>
          </div>
        </div>
      </section>

      <LanguageStats repository={repository} />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg border border-orange-400/15 bg-orange-400/[0.07] text-orange-300">
              <Sparkles size={15} />
            </div>
            <div>
              <p className="text-[10px] text-muted">01 / Context</p>
              <h2 className="mt-0.5 text-sm font-semibold text-slate-100">
                The problem
              </h2>
            </div>
          </div>
          <p className="mt-4 text-xs leading-7 text-slate-300 sm:text-sm">
            {content.problem}
          </p>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div
            className={`flex size-8 items-center justify-center rounded-lg border ${accent.border} ${accent.background} ${accent.text}`}
          >
            <ShieldCheck size={15} />
          </div>
          <p className="mt-3 text-[10px] text-muted">02 / Approach</p>
          <h2 className="mt-0.5 text-sm font-semibold text-slate-100">
            The solution
          </h2>
          <p className="mt-4 text-xs leading-7 text-slate-300 sm:text-sm">
            {content.solution}
          </p>
        </section>
      </div>

      <ProjectFeatures features={content.features} accent={accent} />

      <EngineeringDecisions notes={content.engineeringNotes} accent={accent} />

      <WorkflowArchitecture
        workflow={content.workflow}
        projectName={repository.name}
        accent={accent}
      />

      <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <SectionHeading
          eyebrow="Repository information"
          title="More about this project"
          description="Metadata provided by GitHub for the selected public repository."
        />

        <div className="mt-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <span className="text-xs text-muted">Repository</span>
            <a
              href={repository.html_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 break-all text-xs text-slate-200 transition hover:text-violet-300"
            >
              {repository.full_name}
              <ExternalLink size={12} />
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <span className="text-xs text-muted">Default branch</span>
            <span className="rounded-md border border-white/[0.08] bg-white/[0.025] px-2 py-1 font-mono text-xs text-slate-300">
              {repository.default_branch}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <span className="text-xs text-muted">Last updated</span>
            <span className="text-xs text-slate-300">
              {new Intl.DateTimeFormat("en", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(repository.updated_at))}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted">Repository topics</span>
            <span className="text-xs text-slate-300">
              {technologies.length > 0
                ? technologies.join(", ")
                : "No topics configured"}
            </span>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <p className="text-[10px] text-muted">
          Project workspace / {repository.name}
        </p>
        <button
          type="button"
          onClick={() => navigate("/projects")}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-slate-300 transition hover:bg-white/[0.04] hover:text-slate-100"
        >
          <ArrowLeft size={13} />
          All projects
        </button>
      </div>
    </div>
  );
}
