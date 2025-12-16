import { Link } from "react-router-dom";
import { MessageCircle, Mail, ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { usePage } from "@/hooks/usePages";
import { Skeleton } from "@/components/ui/skeleton";

// Simple markdown-like renderer for page content
const renderContent = (content: string) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const processText = (text: string) => {
    // Process bold text
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const flushList = () => {
    if (listItems.length > 0 && listType) {
      const ListTag = listType;
      elements.push(
        <ListTag key={elements.length} className="list-disc list-inside text-lg leading-relaxed text-foreground space-y-2 ml-4 mb-4">
          {listItems.map((item, i) => (
            <li key={i}>{processText(item)}</li>
          ))}
        </ListTag>
      );
      listItems = [];
      listType = null;
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      flushList();
      return;
    }

    // Headings
    if (trimmedLine.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={index} className="text-2xl font-semibold text-foreground mb-4 mt-8">
          {processText(trimmedLine.slice(3))}
        </h2>
      );
      return;
    }

    // Horizontal rule
    if (trimmedLine === '---') {
      flushList();
      elements.push(<hr key={index} className="border-border my-8" />);
      return;
    }

    // List items
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      listItems.push(trimmedLine.slice(2));
      return;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={index} className="text-lg leading-relaxed text-foreground mb-3">
        {processText(trimmedLine)}
      </p>
    );
  });

  flushList();
  return elements;
};

const Shipping = () => {
  const { data: page, isLoading } = usePage("spedizione");
  
  const whatsappMessage = `Ciao, mi chiamo .......
Ed ho le seguenti domande:

`;
  const whatsappLink = `https://wa.me/393666295174?text=${encodeURIComponent(whatsappMessage)}`;
  const emailLink = `mailto:me@octowonders.com?subject=${encodeURIComponent("Domanda Spedizione")}&body=${encodeURIComponent(whatsappMessage)}`;
  
  return (
    <div className="min-h-screen bg-background pt-24 pb-16 flex flex-col">
      {/* Back to Gallery button */}
      <Link to="/" className="fixed top-4 left-4 z-40 inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all duration-300 font-medium bg-gold text-primary opacity-75 hover:opacity-100 hover:scale-105 hover:shadow-xl">
        <ArrowLeft className="h-5 w-5" />
        <span className="hidden sm:inline">Torna alla Galleria</span>
      </Link>
      
      <main className="max-w-[800px] mx-auto px-4 sm:px-8 md:px-16">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          {page?.title || "Regole di Spedizione"}
        </h1>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        ) : (
          <div className="prose prose-lg max-w-none">
            {page?.content && renderContent(page.content)}
          </div>
        )}

        {/* Contact Section - always visible */}
        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Hai Domande?
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground mb-6">
            Rispondiamo al più presto, e comunque entro 24 ore.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold h-14 text-lg">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" />
                WhatsApp
              </a>
            </Button>
            
            <Button asChild size="lg" variant="secondary" className="flex-1 bg-gray-100 hover:bg-gray-200 text-black font-bold h-14 text-lg">
              <a href={emailLink}>
                <Mail className="mr-2 h-5 w-5" />
                Email
              </a>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Shipping;