
import { useState } from "react";
import { Plus, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
};

export function ProjectFormDialog({ open, onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!open) return null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanName = name.trim();
    if (!cleanName) return;

    onCreate(cleanName, description.trim());
    setName("");
    setDescription("");
  }

  function handleClose() {
    setName("");
    setDescription("");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-title"
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#1B1E25] p-6 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
              New workspace item
            </p>
            <h2 id="create-title" className="mt-2 text-xl font-semibold">
              Create a project
            </h2>
          </div>

          <button
            type="button"
            aria-label="Close dialog"
            onClick={handleClose}
            className="rounded-lg p-2 text-muted transition hover:bg-white/[0.06] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="project-name"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Project name
            </label>
            <input
              id="project-name"
              autoFocus
              required
              maxLength={70}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. My next big idea"
              className="h-11 w-full rounded-xl border border-white/10 bg-[#111318] px-3.5 text-sm outline-none transition placeholder:text-muted/70 focus:border-accent/60"
            />
          </div>

          <div>
            <label
              htmlFor="project-description"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Description <span className="text-muted">(optional)</span>
            </label>
            <textarea
              id="project-description"
              rows={3}
              maxLength={240}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What are you building?"
              className="w-full resize-y rounded-xl border border-white/10 bg-[#111318] px-3.5 py-3 text-sm outline-none transition placeholder:text-muted/70 focus:border-accent/60"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-white/[0.07] pt-5">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.05]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-[#111318] transition hover:bg-[#c1cbff]"
            >
              <Plus size={16} />
              Create project
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
