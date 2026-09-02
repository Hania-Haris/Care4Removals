"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { startQuoteForLead } from "@/app/actions/quotes";

export default function StartQuoteButton({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      className="btn btn-primary"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await startQuoteForLead(leadId);
          if (res.ok && res.quoteId) {
            router.push(`/admin/quotes/${res.quoteId}`);
          }
        })
      }
    >
      {pending ? "Creating…" : "Create quote"}
    </button>
  );
}
