import ReactMarkdown from "react-markdown";
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">{page.title}</h1>
          <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
            <ReactMarkdown>{page.content}</ReactMarkdown>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

export default PageContent;
