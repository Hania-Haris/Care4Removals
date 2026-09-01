import { describe, it, expect } from "vitest";
import { JOB_STATUSES, JOB_TRANSITIONS } from "./job-constants";

describe("job status transitions", () => {
  it("completed and cancelled are terminal", () => {
    expect(JOB_TRANSITIONS.completed).toEqual([]);
    expect(JOB_TRANSITIONS.cancelled).toEqual([]);
  });

  it("cannot skip straight to completed from pending-confirmation", () => {
    expect(JOB_TRANSITIONS["pending-confirmation"]).not.toContain("completed");
  });

  it("every non-terminal status can be cancelled", () => {
    for (const s of JOB_STATUSES) {
      if (s === "completed" || s === "cancelled") continue;
      expect(JOB_TRANSITIONS[s]).toContain("cancelled");
    }
  });

  it("all targets are valid statuses", () => {
    for (const targets of Object.values(JOB_TRANSITIONS)) {
      for (const t of targets) expect(JOB_STATUSES).toContain(t);
    }
  });
});
