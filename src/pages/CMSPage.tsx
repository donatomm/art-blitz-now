/**
 * Generic CMS Page Component for SSG
 * Renders content from the pages table with full SEO support
 * Supports nested slugs like blog/article1
 */

import { useLocation, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import PageContent from "@/components/PageContent";
import { getStaticPageBySlug } from "@/hooks/useStaticPages";

const NotFound = lazy(() => import("./NotFound"));

const CMSPage = () => {
  const location = useLocation();
  
  // Derive slug from pathname: /blog/article1 → blog/article1
  const rawSlug = location.pathname
    .replace(/^\/+|\/+$/g, '')  // Trim leading/trailing slashes
    .replace(/\/+/g, '/');       // Collapse multiple slashes
  
  // Client-side redirect for uppercase URLs to lowercase (SEO canonical)
  if (rawSlug !== rawSlug.toLowerCase()) {
    return <Navigate to={`/${rawSlug.toLowerCase()}`} replace />;
  }
  
  const slug = rawSlug.toLowerCase();
  const staticPage = getStaticPageBySlug(slug);
  
  // If no page found, render NotFound
  if (!staticPage) {
    return (
      <Suspense fallback={<div className="min-h-screen" />}>
        <NotFound />
      </Suspense>
    );
  }
  
  // Build breadcrumbs (support nested: blog/article1 → Home > Blog > Article1)
  const parts = slug.split('/');
  const breadcrumbs = [{ name: "Home", url: "/" }];
  let accumulatedPath = '';
  parts.forEach((part, i) => {
    accumulatedPath += `/${part}`;
    breadcrumbs.push({
      name: i === parts.length - 1 ? (staticPage.title || part) : part,
      url: accumulatedPath,
    });
  });
  
  return (
    <PageContent 
      slug={slug} 
      breadcrumbs={breadcrumbs}
    />
  );
};

export default CMSPage;
