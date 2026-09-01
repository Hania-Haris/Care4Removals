import { describe, it, expect } from "vitest";
import { LEAD_TRANSITIONS, LEAD_STATUSES } from "./lead-constants";

describe("lead status transitions", () => {
  it("cannot jump straight from new to won", () => {
    expect(LEAD_TRANSITIONS.new).not.toContain("won");
  });

  it("only quote-sent leads to won", () => {
    const canWin = LEAD_STATUSES.filter((s) =>
      LEAD_TRANSITIONS[s]?.includes("won")
    );
    expect(canWin).toEqual(["quote-sent"]);
  });

  it("every status can be archived (except archived itself)", () => {
    for (const s of LEAD_STATUSES) {
      if (s === "archived") continue;
      expect(LEAD_TRANSITIONS[s]).toContain("archived");
    }
  });

  it("every target status is a known status", () => {
    for (const targets of Object.values(LEAD_TRANSITIONS)) {
      for (const t of targets) {
        expect(LEAD_STATUSES).toContain(t);
      }
    }
  });
});
