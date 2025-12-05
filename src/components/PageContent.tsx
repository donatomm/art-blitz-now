import Navigation from "@/components/Navigation";
import { usePage } from "@/hooks/usePages";
import { Skeleton } from "@/components/ui/skeleton";
import { marked } from "marked";
import contentBg from "@/assets/content-bg.jpg";

interface PageContentProps {
  slug: string;
  children?: React.ReactNode;
}

// Configure marked for security and styling
marked.setOptions({
  breaks: true,
  gfm: true,
});

const PageContent = ({ slug, children }: PageContentProps) => {
  const { data: page, isLoading, error } = usePage(slug);

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

  const htmlContent = marked.parse(page.content) as string;

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${contentBg})` }}
    >
      <div className="min-h-screen bg-black/30">
        <Navigation />
        <main className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-3xl mx-auto bg-black/50 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/10">
            <h1 className="text-4xl font-bold mb-8 text-white">{page.title}</h1>
            <div 
              className="prose prose-lg prose-invert max-w-none prose-headings:text-white prose-p:text-white/90 prose-strong:text-white prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80 prose-li:text-white/90 prose-ul:list-disc prose-ol:list-decimal"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PageContent;