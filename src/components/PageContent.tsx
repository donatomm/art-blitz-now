import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";
import Navigation from "@/components/Navigation";
import NotFound from "@/pages/NotFound";
import { usePage } from "@/hooks/usePages";
import { getStaticPageBySlug } from "@/hooks/useStaticPages";
import { Skeleton } from "@/components/ui/skeleton";
import { sanitizeHtml, sanitizeInlineHtml, processHtmlDocument, isFullHtmlDocument } from "@/utils/sanitizeHtml";

interface Breadcrumb {
  name: string;
  url: string;
}

interface PageContentProps {
  slug: string;
  children?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
}

// Check if content contains HTML tags
const containsHTML = (str: string): boolean => {
  return /<[a-z][\s\S]*>/i.test(str);
};

const PageContent = ({ slug, children, breadcrumbs }: PageContentProps) => {
  // Static page from prebuild (available immediately for SSG - no loading skeleton for crawlers)
  const staticPage = getStaticPageBySlug(slug);
  
  // Live page from database (client-side hydration/refresh)
  const { data: livePage, isLoading } = usePage(slug);
  
  // Use live data if available, fallback to static for SSG render
  const page = livePage ?? staticPage;

  // Simple markdown renderer for basic formatting
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    let listType: 'ul' | 'ol' | null = null;
    
    const flushList = () => {
      if (currentList.length > 0 && listType) {
        const ListTag = listType;
        elements.push(
          <ListTag key={elements.length} className={`${listType === 'ul' ? 'list-disc' : 'list-decimal'} pl-6 mb-4 space-y-1`}>
            {currentList.map((item, i) => (
              <li key={i} className="text-muted-foreground">{renderInlineFormatting(item)}</li>
            ))}
          </ListTag>
        );
        currentList = [];
        listType = null;
      }
    };

    const renderInlineFormatting = (text: string): React.ReactNode => {
      // Handle bold **text**
      const parts = text.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
        }
        // Handle inline images ![alt](url) and links [text](url)
        const inlineParts = part.split(/(!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\))/g);
        return inlineParts.map((inlinePart, j) => {
          // Check for image first
          const imageMatch = inlinePart.match(/!\[([^\]]*)\]\(([^)]+)\)/);
          if (imageMatch) {
            // Sanitize alt text to prevent XSS
            const sanitizedAlt = sanitizeInlineHtml(imageMatch[1]);
            return <img key={`${i}-${j}`} src={imageMatch[2]} alt={sanitizedAlt} className="inline max-h-64 rounded" />;
          }
          // Check for link
          const linkMatch = inlinePart.match(/\[([^\]]+)\]\(([^)]+)\)/);
          if (linkMatch) {
            return <a key={`${i}-${j}`} href={linkMatch[2]} className="text-primary underline hover:text-primary/80">{linkMatch[1]}</a>;
          }
          return inlinePart;
        });
      });
    };
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Handle headings
      if (trimmedLine.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={index} className="text-2xl font-bold mt-8 mb-4 text-foreground">
            {trimmedLine.slice(3)}
          </h2>
        );
      } else if (trimmedLine.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={index} className="text-3xl font-bold mt-8 mb-4 text-foreground">
            {trimmedLine.slice(2)}
          </h1>
        );
      }
      // Handle unordered list items
      else if (trimmedLine.startsWith('- ')) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        currentList.push(trimmedLine.slice(2));
      }
      // Handle ordered list items
      else if (/^\d+\.\s/.test(trimmedLine)) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        currentList.push(trimmedLine.replace(/^\d+\.\s/, ''));
      }
      // Handle block-level images ![alt](url)
      else if (/^!\[[^\]]*\]\([^)]+\)$/.test(trimmedLine)) {
        flushList();
        const imageMatch = trimmedLine.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        if (imageMatch) {
          elements.push(
            <img 
              key={index} 
              src={imageMatch[2]} 
              alt={imageMatch[1]} 
              className="w-full max-w-lg mx-auto rounded-lg shadow-md my-6"
              loading="lazy"
            />
          );
        }
      }
      // Handle regular paragraphs
      else if (trimmedLine) {
        flushList();
        elements.push(
          <p key={index} className="text-muted-foreground mb-4 leading-relaxed">
            {renderInlineFormatting(trimmedLine)}
          </p>
        );
      }
      // Handle empty lines (paragraph breaks)
      else {
        flushList();
      }
    });
    
    flushList(); // Flush any remaining list items
    return elements;
  };

  // Process and sanitize HTML content to prevent XSS attacks
  // Scripts and dangerous elements are stripped for security
  const processHTML = (html: string): string => {
    // Remove leading markdown heading if present (will be shown separately)
    const withoutHeading = html.replace(/^#\s+[^\n]+\n/, '');
    
    // Check if it's a full HTML document with embedded styles
    if (isFullHtmlDocument(withoutHeading)) {
      return processHtmlDocument(withoutHeading);
    }
    
    // Sanitize to remove scripts and dangerous content
    return sanitizeHtml(withoutHeading);
  };

  // Determine content type - use explicit content_type if available, fallback to detection
  const isHTMLContent = page?.content_type === 'html' || (page?.content && containsHTML(page.content));

  // Only show loading skeleton if no static data (shouldn't happen for SSG pages)
  if (isLoading && !staticPage) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-16">
        <main className="container mx-auto px-4">
          <div className="max-w-4xl space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </main>
      </div>
    );
  }

  if (!page) {
    return <NotFound />;
  }

  return (
    <>
      <Navigation />
      
      {/* Fixed back button - unified style with Product pages */}
      <Link to="/" className="fixed top-[68px] left-4 z-40 inline-flex items-center gap-2 px-4 py-1.5 rounded-full shadow-lg transition-all duration-300 font-medium bg-gold text-primary opacity-90 hover:opacity-100 hover:scale-105 hover:shadow-xl text-sm">
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Torna alla Galleria</span>
      </Link>
      
      <div className="min-h-screen bg-background pt-16 pb-16">
      <SEO 
        title={page.seo_title || page.title}
        description={page.seo_description || `${page.title} - OctoWonders`}
        url={`/${slug}`}
        breadcrumbs={breadcrumbs}
      />
      
      
      <main className="container mx-auto px-4 pt-8 pb-16">
        <div className="max-w-4xl">
          {!isHTMLContent && <h1 className="text-4xl font-bold mb-8">{page.title}</h1>}
          <div className={isFullHtmlDocument(page.content) ? "" : "prose prose-lg max-w-none"}>
            {isHTMLContent ? (
              <div 
                dangerouslySetInnerHTML={{ __html: processHTML(page.content) }}
              />
            ) : (
              renderContent(page.content)
            )}
          </div>
          {children}
        </div>
      </main>
      </div>
    </>
  );
};

export default PageContent;
