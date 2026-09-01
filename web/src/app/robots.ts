import type { MetadataRoute } from "next";

// Admin/auth routes are excluded once they exist (Phase 5). Placeholder now
// so the pattern is established before /admin/* is built.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
  };
}
