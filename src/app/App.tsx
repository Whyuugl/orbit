import { useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { AppShell } from "../layouts/AppShell";
import { ProjectsPage } from "../features/projects/pages/ProjectsPage";
import { ProjectDetailPage } from "../features/projects/pages/ProjectDetailPage";
import { DashboardOverviewPage } from "../features/planner/pages/DashboardOverviewPage";
import { PlannerPage } from "../features/planner/pages/PlannerPage";
import { DataLabPage } from "../features/data-lab/pages/DataLabPage";

function AppContent() {
  const [activeNav, setActiveNav] = useState("Overview");
  const navigate = useNavigate();
  const location = useLocation();

  const currentNav = location.pathname.startsWith("/projects")
  ? "Projects"
  : location.pathname.startsWith("/planner")
    ? "Planner"
    : location.pathname.startsWith("/data-lab")
      ? "Data Lab"
      : location.pathname === "/"
        ? "Overview"
        : activeNav;

  function handleNavigate(name: string) {
    if (name === "Overview") {
      setActiveNav("Overview");
      navigate("/");
      return;
    }

    if (name === "Projects") {
      setActiveNav("Projects");
      navigate("/projects");
      return;
    }

    if (name === "Planner") {
      setActiveNav("Planner");
      navigate("/planner");
      return;
    }

    if (name === "Data Lab") {
      setActiveNav("Data Lab");
      navigate("/data-lab");
      return;
    }

    setActiveNav(name);
  }

  return (
    <AppShell
      activeNav={currentNav}
      onNavigate={handleNavigate}
      onNotify={() => {
        // Notification behavior will be implemented separately.
      }}
    >
      <Routes>
        <Route path="/" element={<DashboardOverviewPage />} />

        <Route
          path="/projects"
          element={
            <ProjectsPage
              activeNav="Projects"
              onNavigate={handleNavigate}
            />
          }
        />

        <Route
          path="/projects/:projectId"
          element={<ProjectDetailPage />}
        />

        <Route path="/planner" element={<PlannerPage />} />

        <Route path="/data-lab" element={<DataLabPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}