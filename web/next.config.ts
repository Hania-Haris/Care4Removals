import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/about.html", destination: "/about", permanent: true },
      { source: "/services.html", destination: "/services", permanent: true },
      { source: "/faq.html", destination: "/faqs", permanent: true },
      { source: "/contact.html", destination: "/contact", permanent: true },
      {
        source: "/quote.html",
        destination: "/get-a-quote",
        permanent: true,
      },
      // Legacy admin HTML pages → new admin routes
      { source: "/admin/login.html", destination: "/admin/login", permanent: true },
      {
        source: "/admin/dashboard.html",
        destination: "/admin/dashboard",
        permanent: true,
      },
      { source: "/dashboard.html", destination: "/admin/dashboard", permanent: true },
      {
        source: "/admin/booking.html",
        destination: "/admin/leads",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
