import type { Metadata } from "next";
import { getBaseUrl } from "@/lib/urls";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: "Care4Removals | Moving Made Easier",
    template: "%s | Care4Removals",
  },
  description:
    "Care4Removals — reliable removal services from the Care4Properties team. Request a free removal quote today.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Care4Removals",
    title: "Care4Removals | Moving Made Easier",
    description:
      "Reliable removal services from the Care4Properties team. Request a free removal quote today.",
  },
  twitter: {
    card: "summary",
    title: "Care4Removals | Moving Made Easier",
    description:
      "Reliable removal services from the Care4Properties team.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
