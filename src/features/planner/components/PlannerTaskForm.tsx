import { useState, type FormEvent } from "react";
import { X } from "lucide-react";

import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  type CreatePlannerTaskInput,
  type TaskCategory,
  type TaskPriority,
} from "../types/planner";

import type { GitHubRepository } from "../../../services/github";

type Props = {
  repositories: GitHubRepository[];
  initialDueDate?: string;
  onSubmit: (input: CreatePlannerTaskInput) => void;
  onClose: () => void;
};

const CATEGORY_LABELS: Record<TaskCategory, string> = {
  coding: "Coding",
  learning: "Learning",
  personal: "Personal",
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

function getToday(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function PlannerTaskForm({
  repositories,
  initialDueDate,
  onSubmit,
  onClose,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>("coding");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState(initialDueDate ?? getToday());
  const [repositoryId, setRepositoryId] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedTitle = title.trim();

    if (!normalizedTitle || !dueDate) {
      return;
    }

    onSubmit({
      title: normalizedTitle,
      description: description.trim(),
      category,
      priority,
      dueDate,
      repositoryId: repositoryId ? Number(repositoryId) : null,
    });

    onClose();
  }

  const fieldClass =
    "mt-1.5 w-full rounded-lg border border-white/[0.09] bg-[#17181d] px-3 py-2.5 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-sky-400/40";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/65 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="my-auto w-full max-w-lg rounded-2xl border border-white/[0.09] bg-[#141519] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-white">
              Create a task
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Add something you want to accomplish.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close task form"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
          >
            <X size={17} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <label className="block text-xs font-medium text-slate-300">
            Task title *
            <input
              autoFocus
              required
              maxLength={120}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Finish Qraft API scanner"
              className={fieldClass}
            />
          </label>

          <label className="block text-xs font-medium text-slate-300">
            Description
            <textarea
              rows={3}
              maxLength={1000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What needs to be done?"
              className={`${fieldClass} resize-y`}
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-xs font-medium text-slate-300">
              Category
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as TaskCategory)
                }
                className={fieldClass}
              >
                {TASK_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {CATEGORY_LABELS[item]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-medium text-slate-300">
              Priority
              <select
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as TaskPriority)
                }
                className={fieldClass}
              >
                {TASK_PRIORITIES.map((item) => (
                  <option key={item} value={item}>
                    {PRIORITY_LABELS[item]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-xs font-medium text-slate-300">
            Due date *
            <input
              type="date"
              required
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className={fieldClass}
            />
          </label>

          <label className="block text-xs font-medium text-slate-300">
            Link to GitHub repository
            <select
              value={repositoryId}
              onChange={(event) => setRepositoryId(event.target.value)}
              className={fieldClass}
            >
              <option value="">No linked repository</option>
              {repositories.map((repository) => (
                <option key={repository.id} value={repository.id}>
                  {repository.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/[0.07] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-lg bg-sky-400 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-sky-300"
          >
            Add task
          </button>
        </div>
      </form>
    </div>
  );
}