import Navigation from "@/components/Navigation";
import { usePage } from "@/hooks/usePages";
import { Skeleton } from "@/components/ui/skeleton";

interface PageContentProps {
  slug: string;
  children?: React.ReactNode;
}

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

  // Simple markdown-like rendering for basic formatting
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-2xl font-semibold mt-6 mb-3 text-foreground">{line.slice(3)}</h2>;
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="text-muted-foreground ml-4">{line.slice(2)}</li>;
      }
      if (line.trim() === '') {
        return <br key={i} />;
      }
      // Handle **bold** text
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="text-muted-foreground mb-2">
          {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-foreground">{part}</strong> : part)}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
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