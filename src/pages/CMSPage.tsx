/**
 * Generic CMS Page Component for SSG
 * Renders content from the pages table with full SEO support
 */

import { useParams, Navigate } from "react-router-dom";
import PageContent from "@/components/PageContent";
import { getStaticPageBySlug } from "@/hooks/useStaticPages";

const CMSPage = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // Layer 3: Client-side redirect for uppercase URLs to lowercase (SEO canonical)
  if (slug && slug !== slug.toLowerCase()) {
    return <Navigate to={`/${slug.toLowerCase()}`} replace />;
  }
  
  const staticPage = getStaticPageBySlug(slug || "");
  
  return (
    <PageContent 
      slug={slug || ""} 
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: staticPage?.title || slug || "", url: `/${slug}` },
      ]}
    />
  );
};

export default CMSPage;
