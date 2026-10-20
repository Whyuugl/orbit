
import type { Project } from "../types/project";

export const initialProjects: Project[] = [
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
