
import { BookOpen, FolderKanban, ShieldCheck, Terminal } from "lucide-react";
import type { Project } from "../types/project";

type Props = {
  project: Project;
};

export function ProjectIcon({ project }: Props) {
  const iconProps = { size: 21, strokeWidth: 1.8 };

  const icons = {
    terminal: <Terminal {...iconProps} />,
    book: <BookOpen {...iconProps} />,
    shield: <ShieldCheck {...iconProps} />,
    web: <FolderKanban {...iconProps} />,
  };

  const accentClasses = {
    violet: "bg-violet-400/10 text-violet-300 ring-violet-300/15",
    green: "bg-emerald-400/10 text-emerald-300 ring-emerald-300/15",
    blue: "bg-blue-400/10 text-blue-300 ring-blue-300/15",
    orange: "bg-orange-400/10 text-orange-300 ring-orange-300/15",
  };

  return (
    <div
      className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${accentClasses[project.accent]}`}
    >
      {icons[project.icon]}
    </div>
  );
}
