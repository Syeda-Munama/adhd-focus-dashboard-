export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type EnergyLevel = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "PENDING" | "ACTIVE" | "DONE" | "SKIPPED" | "SNOOZED";

export interface Task {
  id: string;
  dumpId: string | null;
  userId: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: Priority;
  estimatedMinutes: number | null;
  energyLevel: EnergyLevel;
  status: TaskStatus;
  orderIndex: number;
  snoozedUntil: string | null;
  createdAt: string;
  completedAt: string | null;
}

/**
 * Shape the AI is asked to return for each extracted task.
 * This is the contract between prompts.ts and the parsing route —
 * if you change one, change the other.
 */
export interface ExtractedTask {
  title: string;
  description?: string;
  category: string;
  priority: Priority;
  estimatedMinutes: number;
  energyLevel: EnergyLevel;
}

export interface ParseDumpResponse {
  tasks: ExtractedTask[];
  // Non-actionable venting the AI filtered out, surfaced so the user
  // can see the dump was actually read rather than silently dropped.
  ignoredNotes?: string[];
}
