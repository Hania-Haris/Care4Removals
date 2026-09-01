import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Staff", template: "%s | Care4Removals Staff" },
  // The entire admin surface must never be indexed. A robots.ts disallow
  // also covers /admin/, this is defence in depth.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
