/**
 * Nested CMS Page Component for SSG
 * Handles paths like /blog/article-title with breadcrumb support
 */

import { useParams } from "react-router-dom";
import PageContent from "@/components/PageContent";
import { getStaticPageBySlug } from "@/hooks/useStaticPages";

// Helper to capitalize first letter
const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
};

const NestedCMSPage = () => {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  
  // Combine to full nested path
  const fullSlug = `${category}/${slug}`;
  const staticPage = getStaticPageBySlug(fullSlug);
  
  // Generate breadcrumbs for nested path
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: capitalizeFirst(category || ""), url: `/${category}` },
    { name: staticPage?.title || capitalizeFirst(slug || ""), url: `/${fullSlug}` },
  ];
  
  return (
    <PageContent 
      slug={fullSlug} 
      breadcrumbs={breadcrumbs}
    />
  );
};

export default NestedCMSPage;
