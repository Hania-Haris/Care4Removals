import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
