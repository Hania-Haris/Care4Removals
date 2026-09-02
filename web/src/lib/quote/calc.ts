import type { LineItem } from "@/lib/types";

// All quote arithmetic lives here and runs server-side only (called from
// server actions). Totals are always recomputed from line items — a client
// never sends a total. Manual pricing is the model for v1 (see
// DECISIONS_REQUIRED.md #5): staff enter each line's unitPrice/quantity.

export type VatMode = "none" | "inclusive" | "exclusive";

export type RawLineItem = {
  description: string;
  category: string;
  quantity: number;
  unitPrice: number; // in pence, integer
};

export type QuoteTotals = {
  lineItems: LineItem[];
  subtotal: number; // pence
  tax: number; // pence
  total: number; // pence
};

function round(n: number): number {
  return Math.round(n);
}

/**
 * Deterministic: same inputs always produce the same totals, so a stored
 * quoteVersion can be re-verified later. Currency is integer pence throughout
 * to avoid floating-point drift.
 */
export function calculateQuote(
  rawItems: RawLineItem[],
  vatMode: VatMode,
  vatRate = 0.2
): QuoteTotals {
  const lineItems: LineItem[] = rawItems.map((it) => {
    const quantity = Number.isFinite(it.quantity) ? Math.max(0, it.quantity) : 0;
    const unitPrice = Number.isFinite(it.unitPrice)
      ? Math.max(0, round(it.unitPrice))
      : 0;
    return {
      description: it.description.trim(),
      category: it.category.trim(),
      quantity,
      unitPrice,
      total: round(quantity * unitPrice),
    };
  });

  const gross = lineItems.reduce((sum, it) => sum + it.total, 0);

  let subtotal: number;
  let tax: number;
  let total: number;

  switch (vatMode) {
    case "exclusive":
      subtotal = gross;
      tax = round(gross * vatRate);
      total = subtotal + tax;
      break;
    case "inclusive":
      // Prices already include VAT — back it out for display.
      total = gross;
      subtotal = round(gross / (1 + vatRate));
      tax = total - subtotal;
      break;
    case "none":
    default:
      subtotal = gross;
      tax = 0;
      total = gross;
      break;
  }

  return { lineItems, subtotal, tax, total };
}

export function formatPence(pence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100);
}
