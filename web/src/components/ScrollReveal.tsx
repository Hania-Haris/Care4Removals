"use client";

import { useEffect } from "react";

/**
 * Re-implements the legacy js/main.js scroll-reveal behavior as a client
 * component instead of a page-level inline script. Content marked
 * [data-reveal] must remain visible if JS fails or IntersectionObserver is
 * unsupported — handled below, and reduced-motion is handled in site.css.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const items = document.querySelectorAll("[data-reveal]");

    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("reveal-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return null;
}
