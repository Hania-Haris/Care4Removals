import type { JobStatus } from "@/lib/types";

// Pure constants, no server-only imports — unit-testable + client-safe.

export const JOB_STATUSES: JobStatus[] = [
  "pending-confirmation",
  "confirmed",
  "scheduled",
  "in-progress",
  "completed",
  "cancelled",
];

export const JOB_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  "pending-confirmation": ["confirmed", "cancelled"],
  confirmed: ["scheduled", "cancelled"],
  scheduled: ["in-progress", "cancelled"],
  "in-progress": ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};
