import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { usePage } from "@/hooks/usePages";
import { Skeleton } from "@/components/ui/skeleton";

interface PageContentProps {
  slug: string;
  children?: React.ReactNode;
}

const PageContent = ({ slug, children }: PageContentProps) => {
  const { data: page, isLoading, error } = usePage(slug);

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
            return <img key={`${i}-${j}`} src={imageMatch[2]} alt={imageMatch[1]} className="inline max-h-64 rounded" />;
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
              className="max-w-full rounded-lg shadow-sm border border-border my-4"
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-3xl mx-auto space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Pagina non trovata</h1>
            <p className="text-muted-foreground">
              Il contenuto richiesto non è disponibile.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={page.seo_title || page.title}
        description={page.seo_description || `${page.title} - OctoWonders`}
        url={`/${slug}`}
      />
      <Navigation />
      
      {/* Back to Gallery button */}
      <Link to="/" className="fixed top-4 left-4 z-40 inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all duration-300 font-medium bg-gold text-primary opacity-75 hover:opacity-100 hover:scale-105 hover:shadow-xl">
        <ArrowLeft className="h-5 w-5" />
        <span className="hidden sm:inline">Torna alla Galleria</span>
      </Link>
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">{page.title}</h1>
          <div className="prose prose-lg max-w-none">
            {renderContent(page.content)}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

export default PageContent;
