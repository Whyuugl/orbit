
export type ProjectStatus = "In progress" | "Planning" | "Completed";

export type ProjectCategory =
  | "Developer tools"
  | "Web application"
  | "UI/UX";

export type ProjectIconType = "terminal" | "book" | "shield" | "web";

export type ProjectAccent = "violet" | "green" | "blue" | "orange";

export type Project = {
  id: number;
  name: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  technologies: string[];
  progress: number;
  icon: ProjectIconType;
  accent: ProjectAccent;
};
