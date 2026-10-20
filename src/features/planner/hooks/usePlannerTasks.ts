import { useCallback, useEffect, useState } from "react";

import {
  loadPlannerTasks,
  savePlannerTasks,
} from "../services/plannerStorage";

import type {
  CreatePlannerTaskInput,
  PlannerTask,
  TaskStatus,
  UpdatePlannerTaskInput,
} from "../types/planner";

export function usePlannerTasks() {
  const [tasks, setTasks] = useState<PlannerTask[]>(loadPlannerTasks);

  useEffect(() => {
    savePlannerTasks(tasks);
  }, [tasks]);

  const addTask = useCallback((input: CreatePlannerTaskInput) => {
    const now = new Date().toISOString();

    const task: PlannerTask = {
      ...input,
      id: crypto.randomUUID(),
      status: "todo",
      createdAt: now,
      updatedAt: now,
    };

    setTasks((current) => [task, ...current]);

    return task;
  }, []);

  const updateTask = useCallback(
    (id: string, updates: UpdatePlannerTaskInput) => {
      setTasks((current) =>
        current.map((task) =>
          task.id === id
            ? {
                ...task,
                ...updates,
                id: task.id,
                createdAt: task.createdAt,
                updatedAt: new Date().toISOString(),
              }
            : task,
        ),
      );
    },
    [],
  );

  const deleteTask = useCallback((id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id));
  }, []);

  const setTaskStatus = useCallback(
    (id: string, status: TaskStatus) => {
      updateTask(id, { status });
    },
    [updateTask],
  );

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    setTaskStatus,
  };
}