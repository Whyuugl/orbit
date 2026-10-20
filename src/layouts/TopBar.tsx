
import { Bell, Search } from "lucide-react";

type Props = {
  activeNav: string;
  onNotify: () => void;
};

export function TopBar({ activeNav, onNotify }: Props) {
  return (
    <header className="sticky top-0 z-30 flex h-[64px] items-center justify-between border-b border-white/[0.06] bg-workspace/90 px-5 backdrop-blur-xl sm:px-7">
      {/* Breadcrumb */}
      <div className="flex min-w-0 items-center gap-2 text-[11px]">
        <span className="shrink-0 text-muted">Workspace</span>
        <span className="text-white/20">/</span>
        <strong className="truncate font-medium text-slate-200">
          {activeNav}
        </strong>
      </div>

      {/* Actions */}
      <div className="ml-4 flex shrink-0 items-center gap-1.5 sm:gap-2">
        <span className="mr-2 hidden items-center gap-1.5 text-[10px] text-muted lg:flex">
          <span className="size-1.5 rounded-full bg-emerald-300" />
          All systems normal
        </span>

        <button
          type="button"
          aria-label={
            activeNav === "Projects" ? "Search projects" : "Open search"
          }
          title="Search"
          onClick={() => {
            if (activeNav === "Projects") {
              document.getElementById("project-search")?.focus();
            } else {
              onNotify();
            }
          }}
          className="flex size-8 items-center justify-center rounded-[8px] text-muted transition hover:bg-white/[0.055] hover:text-slate-100"
        >
          <Search size={16} strokeWidth={1.8} />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          title="Notifications"
          onClick={onNotify}
          className="relative flex size-8 items-center justify-center rounded-[8px] text-muted transition hover:bg-white/[0.055] hover:text-slate-100"
        >
          <Bell size={16} strokeWidth={1.8} />
        </button>

        <div
          aria-label="Workspace initials WG"
          className="ml-1 flex size-8 items-center justify-center rounded-[9px] border border-white/[0.09] bg-surface font-display text-[10px] font-semibold text-accent"
        >
          WG
        </div>
      </div>
    </header>
  );
}
