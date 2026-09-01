import { describe, it, expect } from "vitest";
import { calculateQuote, formatPence } from "./calc";

const items = [
  { description: "2 movers, 4 hrs", category: "Labour", quantity: 8, unitPrice: 2500 },
  { description: "Luton van", category: "Vehicle", quantity: 1, unitPrice: 9000 },
];
// gross = 8*2500 + 9000 = 29000 pence

describe("calculateQuote", () => {
  it("no VAT: total equals gross, tax zero", () => {
    const r = calculateQuote(items, "none");
    expect(r.subtotal).toBe(29000);
    expect(r.tax).toBe(0);
    expect(r.total).toBe(29000);
  });

  it("VAT exclusive: adds 20% on top", () => {
    const r = calculateQuote(items, "exclusive");
    expect(r.subtotal).toBe(29000);
    expect(r.tax).toBe(5800);
    expect(r.total).toBe(34800);
  });

  it("VAT inclusive: backs VAT out of the gross", () => {
    const r = calculateQuote(items, "inclusive");
    expect(r.total).toBe(29000);
    expect(r.subtotal).toBe(24167); // round(29000 / 1.2)
    expect(r.tax).toBe(29000 - 24167);
  });

  it("is deterministic — same inputs, same output", () => {
    expect(calculateQuote(items, "exclusive")).toEqual(
      calculateQuote(items, "exclusive")
    );
  });

  it("clamps negative quantity/price to zero", () => {
    const r = calculateQuote(
      [{ description: "x", category: "y", quantity: -3, unitPrice: -100 }],
      "none"
    );
    expect(r.total).toBe(0);
  });

  it("handles a discount line as a negative-effect via 0 floor (discounts use category, not sign)", () => {
    // Discounts are represented as their own positive line the staff
    // subtracts manually via override; calc never produces a negative total.
    const r = calculateQuote(
      [{ description: "Deposit paid", category: "Discount", quantity: 1, unitPrice: 5000 }],
      "none"
    );
    expect(r.total).toBe(5000);
  });
});

describe("formatPence", () => {
  it("formats GBP", () => {
    expect(formatPence(29000)).toBe("£290.00");
    expect(formatPence(5)).toBe("£0.05");
  });
});
