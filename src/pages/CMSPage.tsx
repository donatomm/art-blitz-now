/**
 * Generic CMS Page Component for SSG
 * Renders content from the pages table with full SEO support
 */

import { useParams } from "react-router-dom";
import PageContent from "@/components/PageContent";
import { getStaticPageBySlug } from "@/hooks/useStaticPages";

const CMSPage = () => {
  const { slug } = useParams<{ slug: string }>();
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
