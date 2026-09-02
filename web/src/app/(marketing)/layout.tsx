import "../site.css";
import "../refresh.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import StructuredData from "@/components/StructuredData";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StructuredData />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <div id="main-content">{children}</div>
      <SiteFooter />
      
    </>
  );
}
