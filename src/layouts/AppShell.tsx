import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

type Props = {
  children: ReactNode;
  activeNav: string;
  onNavigate: (name: string) => void;
  onNotify: () => void;
};

export function AppShell({
  children,
  activeNav,
  onNavigate,
  onNotify,
}: Props) {
  return (
    <div className="min-h-screen bg-workspace text-slate-100">
      <Sidebar activeNav={activeNav} onNavigate={onNavigate} />

      <div className="min-w-0 md:pl-[240px]">
        <TopBar activeNav={activeNav} onNotify={onNotify} />

        <main className="mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-7 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
