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
    ];
  },
};

export default nextConfig;
