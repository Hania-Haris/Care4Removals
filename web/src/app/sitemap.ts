import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/urls";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseUrl();
  const routes = [
    "",
    "/services",
    "/about",
    "/faqs",
    "/contact",
    "/get-a-quote",
    "/legal/privacy",
    "/legal/terms",
    "/legal/cookies",
  ];
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
