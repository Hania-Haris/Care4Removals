"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

type Faq = {
  id: string;
  q: string;
  a: string;
  category: "Quotes" | "Packing" | "Moving day" | "After your move";
  group: "popular" | "planning";
  cta?: { label: string; href: string };
};

const FAQS: Faq[] = [
  {
    id: "request-quote",
    q: "How do I request a removal quote?",
    a: "Use our online quote form — it takes about a minute. Tell us a few details about your current property, your new property and your preferred date, and we'll come back to you with a clear, no-obligation quote.",
    category: "Quotes",
    group: "popular",
    cta: { label: "Request a free quote", href: "/get-a-quote" },
  },
  {
    id: "info-needed",
    q: "What information do I need to provide?",
    a: "Your name, phone number and email, plus details about the property you're moving from, the property you're moving to and your preferred moving date. You can also add photos and notes about heavy or fragile items.",
    category: "Quotes",
    group: "popular",
  },
  {
    id: "packing-help",
    q: "Can you help with packing?",
    a: "Yes. Careful packing is part of the removal service, using quality materials and proven methods. Let us know in your enquiry whether you'd like a full pack or help with fragile items only.",
    category: "Packing",
    group: "popular",
  },
  {
    id: "process",
    q: "How does the removal process work?",
    a: "Three stages: request a quote, work with the team to plan the move, then we handle the packing, loading, transport and delivery to your new home.",
    category: "Moving day",
    group: "popular",
  },
  {
    id: "after-enquiry",
    q: "What happens after I submit my enquiry?",
    a: "Your enquiry goes straight to the team to review. A member of the team will contact you to confirm the details and send your written quotation.",
    category: "After your move",
    group: "popular",
  },
  {
    id: "moving-day",
    q: "What happens on moving day?",
    a: "The team arrives at the agreed time, protects and loads your belongings, transports everything to your new property and places items in the rooms you want them in.",
    category: "Moving day",
    group: "planning",
  },
  {
    id: "how-long",
    q: "How long will my move take?",
    a: "It depends on the size of your home, access at both properties and the distance involved. We'll give you a realistic time estimate with your quotation.",
    category: "Moving day",
    group: "planning",
  },
  {
    id: "change-date",
    q: "Can I change my moving date?",
    a: "Yes — just let the team know as early as you can and we'll do our best to move your booking to a date that works.",
    category: "Quotes",
    group: "planning",
  },
  {
    id: "storage",
    q: "Do you store items if needed?",
    a: "If there's a gap between moving out and moving in, mention it in your enquiry and we'll talk through short-term storage options as part of your quote.",
    category: "Packing",
    group: "planning",
  },
];

const CATEGORIES = ["All", "Quotes", "Packing", "Moving day", "After your move"] as const;

export default function FaqExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [open, setOpen] = useState<Set<string>>(new Set(["request-quote"]));

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((f) => {
      if (category !== "All" && f.category !== category) return false;
      if (q && !(`${f.q} ${f.a}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [query, category]);

  const popular = filtered.filter((f) => f.group === "popular");
  const planning = filtered.filter((f) => f.group === "planning");
  const searching = query.trim() !== "" || category !== "All";

  const Item = ({ f }: { f: Faq }) => {
    const isOpen = open.has(f.id);
    return (
      <div className={`faqx-item${isOpen ? " is-open" : ""}`}>
        <button
          type="button"
          className="faqx-q"
          aria-expanded={isOpen}
          onClick={() => toggle(f.id)}
        >
          <span>{f.q}</span>
          <span className="faqx-sign" aria-hidden="true">
            {isOpen ? "−" : "+"}
          </span>
        </button>
        {isOpen && (
          <div className="faqx-a">
            <p>{f.a}</p>
            {f.cta && (
              <Link href={f.cta.href} className="faqx-a-link">
                {f.cta.label}
                <Icon name="arrow-right" size={15} />
              </Link>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="faqx">
      <div className="faqx-search">
        <Icon name="search" size={18} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your question"
          aria-label="Search FAQs"
        />
      </div>

      <div className="faqx-pills" role="tablist" aria-label="FAQ categories">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={category === c}
            className={`faqx-pill${category === c ? " is-active" : ""}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="faqx-empty">
          No questions match that search. Try a different term, or{" "}
          <Link href="/contact">ask the team directly</Link>.
        </p>
      ) : searching ? (
        <div className="faqx-results">
          {filtered.map((f) => (
            <Item key={f.id} f={f} />
          ))}
        </div>
      ) : (
        <div className="faqx-columns">
          <div className="faqx-col">
            <h2 className="faqx-col-head">
              <Icon name="star" size={18} />
              Popular questions
            </h2>
            {popular.map((f) => (
              <Item key={f.id} f={f} />
            ))}
          </div>
          <div className="faqx-col">
            <h2 className="faqx-col-head">
              <Icon name="calendar" size={18} />
              Planning your move?
            </h2>
            {planning.map((f) => (
              <Item key={f.id} f={f} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
