
import type { Project } from "./project";

export type TechnologyStat = {
  name: string;
  percentage: number;
  color?: Project["accent"];
};

export type ProjectLink = {
  label: string;
  url: string;
};

export type ProjectFeature = {
  title: string;
  description: string;
};

export type ProjectDetail = {
  projectId: Project["id"];
  tagline: string;
  overview: string;
  problem: string;
  solution: string;
  languageStats: TechnologyStat[];
  features: ProjectFeature[];
  architecture?: string;
  links: {
    repository?: ProjectLink;
    demo?: ProjectLink;
  };
};
