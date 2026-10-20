
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownUp,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Command,
  FileText,
  FolderKanban,
  LayoutDashboard,
  ListFilter,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
} from "lucide-react";
import "./index.css";

type ProjectStatus = "In progress" | "Planning" | "Completed";
type ProjectCategory = "Developer tools" | "Web application" | "UI/UX";

type Project = {
  id: number;
  name: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  technologies: string[];
  progress: number;
  icon: "terminal" | "book" | "shield" | "web";
  accent: string;
};

const initialProjects: Project[] = [
  {
    id: 1,
    name: "Qraft CLI",
    description: "A developer-focused toolkit for smarter QA workflows.",
    category: "Developer tools",
    status: "In progress",
    technologies: ["TypeScript", "Node.js"],
    progress: 65,
    icon: "terminal",
    accent: "violet",
  },
  {
    id: 2,
    name: "Litera",
    description: "A digital library designed for a better learning experience.",
    category: "Web application",
    status: "Planning",
    technologies: ["Vue", "PostgreSQL"],
    progress: 20,
    icon: "book",
    accent: "green",
  },
  {
    id: 3,
    name: "RBAC Audit",
    description: "Role-based access management and audit monitoring.",
    category: "Web application",
    status: "In progress",
    technologies: ["Next.js", "Prisma"],
    progress: 45,
    icon: "shield",
    accent: "blue",
  },
  {
    id: 4,
    name: "Dekor",
    description: "A considered digital storefront for furniture and interiors.",
    category: "UI/UX",
    status: "Completed",
    technologies: ["React", "CSS"],
    progress: 100,
    icon: "web",
    accent: "orange",
  },
];

const statusOptions = ["All projects", "In progress", "Planning", "Completed"];

function ProjectIcon({ project }: { project: Project }) {
  const iconProps = { size: 21, strokeWidth: 1.8 };

  return (
    <div className={`project-icon ${project.accent}`}>
      {project.icon === "terminal" && <Terminal {...iconProps} />}
      {project.icon === "book" && <BookOpen {...iconProps} />}
      {project.icon === "shield" && <ShieldCheck {...iconProps} />}
      {project.icon === "web" && <FolderKanban {...iconProps} />}
    </div>
  );
}

function App() {
  const [projects, setProjects] = useState(initialProjects);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All projects");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [activeNav, setActiveNav] = useState("Projects");
  const [notice, setNotice] = useState("");

  const visibleProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = [
        project.name,
        project.description,
        project.category,
        ...project.technologies,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter =
        filter === "All projects" || project.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [projects, search, filter]);

  const activeCount = projects.filter(
    (project) => project.status === "In progress",
  ).length;

  function createProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = newName.trim();
    if (!name) return;

    const project: Project = {
      id: Date.now(),
      name,
      description: newDescription.trim() || "No description added yet.",
      category: "Web application",
      status: "Planning",
      technologies: ["To be decided"],
      progress: 0,
      icon: "web",
      accent: "blue",
    };

    setProjects((current) => [project, ...current]);
    setNewName("");
    setNewDescription("");
    setShowCreate(false);
    setFilter("All projects");
    setSearch("");
    setNotice(`${name} added to your workspace.`);
  }

  function selectNav(name: string) {
    setActiveNav(name);

    if (name !== "Projects") {
      setNotice(`${name} is planned for a future iteration.`);
    } else {
      setNotice("");
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button
          className="brand"
          onClick={() => selectNav("Overview")}
          aria-label="Open overview"
        >
          <span className="brand-mark">
            <Command size={21} />
          </span>
          <span className="brand-copy">
            <strong>orbit<span>.</span></strong>
            <small>PERSONAL WORKSPACE</small>
          </span>
        </button>

        <div className="workspace-switcher">
          <div className="workspace-avatar">W</div>
          <div className="workspace-copy">
            <strong>My workspace</strong>
            <span>Personal plan</span>
          </div>
          <ChevronDown size={15} />
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <p className="nav-label">WORKSPACE</p>

          <button
            className={`nav-item ${activeNav === "Overview" ? "active" : ""}`}
            onClick={() => selectNav("Overview")}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>

          <button
            className={`nav-item ${activeNav === "Projects" ? "active" : ""}`}
            onClick={() => selectNav("Projects")}
          >
            <FolderKanban size={18} />
            <span>Projects</span>
            <span className="nav-count">{projects.length}</span>
          </button>

          <button
            className={`nav-item ${activeNav === "Tasks" ? "active" : ""}`}
            onClick={() => selectNav("Tasks")}
          >
            <Check size={18} />
            <span>Tasks</span>
          </button>

          <button
            className={`nav-item ${activeNav === "Activity" ? "active" : ""}`}
            onClick={() => selectNav("Activity")}
          >
            <Activity size={18} />
            <span>Activity</span>
          </button>

          <p className="nav-label tools-label">YOUR TOOLS</p>

          <button className="nav-item" onClick={() => selectNav("RBAC")}>
            <ShieldCheck size={18} />
            <span>RBAC Audit</span>
            <span className="tool-dot blue-dot" />
          </button>

          <button className="nav-item" onClick={() => selectNav("DMS")}>
            <FileText size={18} />
            <span>DMS Office</span>
            <span className="tool-dot green-dot" />
          </button>

          <button className="nav-item" onClick={() => selectNav("Litera")}>
            <BookOpen size={18} />
            <span>Litera</span>
          </button>

          <button className="nav-item" onClick={() => selectNav("Qraft CLI")}>
            <Terminal size={18} />
            <span>Qraft CLI</span>
            <span className="tool-dot violet-dot" />
          </button>

          <button className="nav-item" onClick={() => selectNav("Settings")}>
            <Settings2 size={18} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button className="help-link" onClick={() => selectNav("Help")}>
            <CircleHelp size={17} />
            <span>Help & feedback</span>
          </button>

          <div className="profile">
            <div className="profile-avatar">WG</div>
            <div className="profile-copy">
              <strong>Workspace owner</strong>
              <span>Personal account</span>
            </div>
            <MoreHorizontal size={18} />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Workspace</span>
            <span className="breadcrumb-separator">/</span>
            <strong>{activeNav}</strong>
          </div>

          <div className="topbar-actions">
            <span className="system-status">
              <span className="status-dot" />
              All systems normal
            </span>

            <button
              className="icon-button"
              aria-label="Search projects"
              onClick={() => document.getElementById("project-search")?.focus()}
            >
              <Search size={18} />
            </button>

            <button
              className="icon-button"
              aria-label="Notifications"
              onClick={() => setNotice("You're all caught up.")}
            >
              <Bell size={18} />
            </button>

            <div className="topbar-avatar">WG</div>
          </div>
        </header>

        <div className="page-container">
          {activeNav === "Projects" ? (
            <>
              <section className="page-heading">
                <div>
                  <div className="eyebrow">
                    <span className="eyebrow-line" />
                    YOUR CREATIVE SPACE
                  </div>
                  <h1>
                    Your projects<span className="title-period">.</span>
                  </h1>
                  <p className="page-subtitle">
                    Every idea, one place. Keep building.
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => setShowCreate(true)}
                >
                  <Plus size={17} />
                  New project
                </button>
              </section>

              <section className="focus-banner">
                <div className="focus-decoration decoration-one" />
                <div className="focus-decoration decoration-two" />

                <div className="focus-content">
                  <div className="focus-label">
                    <Sparkles size={14} />
                    <span>YOUR SPACE TO CREATE</span>
                  </div>

                  <h2>Good things start<br />with an idea.</h2>
                  <p>
                    Keep your experiments, products, and ideas moving forward.
                  </p>

                  <button
                    className="banner-button"
                    onClick={() => setShowCreate(true)}
                  >
                    Create something new
                    <ArrowUpRight size={16} />
                  </button>
                </div>

                <div className="banner-graphic" aria-hidden="true">
                  <div className="graphic-orbit orbit-one" />
                  <div className="graphic-orbit orbit-two" />
                  <div className="graphic-orbit orbit-three" />
                  <div className="graphic-core">
                    <Command size={32} strokeWidth={1.4} />
                  </div>
                  <span className="graphic-star star-one">✳</span>
                  <span className="graphic-star star-two">✦</span>
                </div>
              </section>

              <section className="stats-row" aria-label="Project summary">
                <div className="stat-item">
                  <span className="stat-label">TOTAL PROJECTS</span>
                  <strong>{projects.length.toString().padStart(2, "0")}</strong>
                  <span className="stat-footnote">Across your workspace</span>
                </div>

                <div className="stat-item">
                  <span className="stat-label">IN PROGRESS</span>
                  <strong>{activeCount.toString().padStart(2, "0")}</strong>
                  <span className="stat-footnote">
                    Currently being built
                  </span>
                </div>

                <div className="stat-item">
                  <span className="stat-label">COMPLETED</span>
                  <strong>
                    {projects
                      .filter((project) => project.status === "Completed")
                      .length.toString()
                      .padStart(2, "0")}
                  </strong>
                  <span className="stat-footnote">Made it across the line</span>
                </div>
              </section>

              <section className="projects-section">
                <div className="section-heading">
                  <div>
                    <h2>All projects</h2>
                    <p>Your work, at a glance.</p>
                  </div>

                  <span className="results-count">
                    {visibleProjects.length} PROJECT
                    {visibleProjects.length === 1 ? "" : "S"}
                  </span>
                </div>

                <div className="project-toolbar">
                  <label className="search-field">
                    <Search size={17} />
                    <input
                      id="project-search"
                      type="search"
                      placeholder="Search projects, tech stack..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                    {search && (
                      <button
                        className="clear-search"
                        aria-label="Clear search"
                        onClick={() => setSearch("")}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </label>

                  <div className="filter-control">
                    <ListFilter size={16} />
                    <select
                      value={filter}
                      onChange={(event) => setFilter(event.target.value)}
                      aria-label="Filter by project status"
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} />
                  </div>

                  <button
                    className="sort-button"
                    onClick={() =>
                      setProjects((current) => [...current].reverse())
                    }
                    title="Reverse project order"
                  >
                    <ArrowDownUp size={16} />
                    <span>Sort</span>
                  </button>
                </div>

                {visibleProjects.length > 0 ? (
                  <div className="project-grid">
                    {visibleProjects.map((project) => (
                      <article className="project-card" key={project.id}>
                        <div className="project-card-top">
                          <ProjectIcon project={project} />
                          <button
                            className="card-menu"
                            aria-label={`Options for ${project.name}`}
                            onClick={() =>
                              setNotice(
                                `${project.name}: editing options will be added in a later step.`,
                              )
                            }
                          >
                            <MoreHorizontal size={20} />
                          </button>
                        </div>

                        <div className="project-info">
                          <div className="project-title-row">
                            <h3>{project.name}</h3>
                            <ArrowUpRight
                              className="project-open-icon"
                              size={16}
                            />
                          </div>
                          <p>{project.description}</p>
                        </div>

                        <div className="tech-list">
                          {project.technologies.map((tech) => (
                            <span className="tech-tag" key={tech}>
                              {tech}
                            </span>
                          ))}
                        </div>

                        <div className="project-progress">
                          <div className="progress-heading">
                            <span>Progress</span>
                            <strong>{project.progress}%</strong>
                          </div>
                          <div
                            className="progress-track"
                            role="progressbar"
                            aria-valuenow={project.progress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${project.name} progress`}
                          >
                            <div
                              className={`progress-fill ${project.accent}`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="project-card-footer">
                          <span className={`status-pill ${project.status.toLowerCase().replace(" ", "-")}`}>
                            <span className="status-dot" />
                            {project.status}
                          </span>
                          <span className="project-category">
                            {project.category}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <Search size={23} />
                    </div>
                    <h3>No projects found</h3>
                    <p>
                      Try a different search or change your status filter.
                    </p>
                    <button
                      className="secondary-button"
                      onClick={() => {
                        setSearch("");
                        setFilter("All projects");
                      }}
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </section>

              <footer className="page-footer">
                <span>Made for ideas that deserve to exist.</span>
                <span>ORBIT WORKSPACE <span className="footer-dot">·</span> V0.1</span>
              </footer>
            </>
          ) : (
            <section className="placeholder-page">
              <div className="placeholder-icon">
                <Command size={27} />
              </div>
              <div className="eyebrow">WORKSPACE MODULE</div>
              <h1>{activeNav}<span className="title-period">.</span></h1>
              <p>
                This part of your workspace is planned, but isn't implemented
                yet. We're building the foundation one module at a time.
              </p>
              <button
                className="secondary-button"
                onClick={() => selectNav("Projects")}
              >
                Back to projects
                <ArrowRight size={16} />
              </button>
            </section>
          )}
        </div>
      </main>

      {notice && (
        <div className="toast" role="status">
          <span className="toast-indicator"><Check size={15} /></span>
          <span>{notice}</span>
          <button aria-label="Dismiss notification" onClick={() => setNotice("")}>
            <X size={15} />
          </button>
        </div>
      )}

      {showCreate && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowCreate(false);
          }}
        >
          <section
            className="create-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-title"
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">NEW WORKSPACE ITEM</span>
                <h2 id="create-title">Create a project</h2>
              </div>
              <button
                className="icon-button"
                aria-label="Close dialog"
                onClick={() => setShowCreate(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={createProject}>
              <label className="form-label" htmlFor="project-name">
                Project name
              </label>
              <input
                id="project-name"
                className="form-input"
                placeholder="e.g. My next big idea"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                required
                autoFocus
                maxLength={70}
              />

              <label className="form-label" htmlFor="project-description">
                Description <span>(optional)</span>
              </label>
              <textarea
                id="project-description"
                className="form-input form-textarea"
                placeholder="What are you building?"
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                rows={3}
                maxLength={240}
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  <Plus size={16} />
                  Create project
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
