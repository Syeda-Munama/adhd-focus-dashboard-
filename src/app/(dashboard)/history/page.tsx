"use client";

import { useEffect, useState } from "react";
import type { Task } from "@/types/task";

export default function HistoryPage() {
  const [tasks, setTasks] = useState<Task[] | null>(null);

  useEffect(() => {
    fetch("/api/dumps/history")
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks));
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-medium text-ink-text">
        Completed
      </h1>

      {tasks === null && <p className="text-ink-text-muted">Loading...</p>}

      {tasks?.length === 0 && (
        <p className="text-ink-text-muted">
          Nothing completed yet — finish a task in Focus and it&apos;ll show
          up here.
        </p>
      )}

      <ul className="space-y-2">
        {tasks?.map((task) => (
          <li
            key={task.id}
            className="flex items-center justify-between rounded-2xl border border-paper-border bg-paper-card px-4 py-3"
          >
            <span className="text-ink-text line-through decoration-paper-border">
              {task.title}
            </span>
            <span className="text-xs text-ink-text-muted">
              {task.completedAt &&
                new Date(task.completedAt).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
