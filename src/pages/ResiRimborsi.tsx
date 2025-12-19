import { ArrowLeft, MessageCircle, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePage } from "@/hooks/usePages";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const renderContent = (content: string) => {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let listItems: string[] = [];
  let listLevel = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 mb-4 text-muted-foreground ml-4">
          {listItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={index} className="text-3xl font-bold text-foreground mb-6">
          {trimmedLine.substring(2)}
        </h1>
      );
    } else if (trimmedLine.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={index} className="text-2xl font-semibold text-foreground mt-8 mb-4">
          {trimmedLine.substring(3)}
        </h2>
      );
    } else if (trimmedLine.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={index} className="text-xl font-medium text-foreground mt-6 mb-3">
          {trimmedLine.substring(4)}
        </h3>
      );
    } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      listItems.push(trimmedLine.substring(2));
    } else if (trimmedLine.startsWith('---')) {
      flushList();
      elements.push(<hr key={index} className="my-6 border-border" />);
    } else if (trimmedLine === '') {
      flushList();
    } else {
      flushList();
      let processedLine = trimmedLine
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>');
      
      elements.push(
        <p 
          key={index} 
          className="text-muted-foreground mb-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: processedLine }}
        />
      );
    }
  });

  flushList();
  return elements;
};

const ResiRimborsi = () => {
  const { data: page, isLoading, error } = usePage("resi-rimborsi");

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Ciao! Vorrei informazioni riguardo a resi e rimborsi.");
    window.open(`https://wa.me/393487046985?text=${message}`, '_blank');
  };

  const handleEmailClick = () => {
    const subject = encodeURIComponent("Richiesta informazioni resi e rimborsi");
    const body = encodeURIComponent("Buongiorno,\n\nVorrei ricevere informazioni riguardo alla politica di resi e rimborsi.\n\nGrazie");
    window.location.href = `mailto:octowonders.official@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title={page?.seo_title || page?.title || "Resi e Rimborsi"}
        description={page?.seo_description || "Politica di resi e rimborsi per i prodotti OctoWonders. Scopri come richiedere un reso o un rimborso."}
        url="https://octowonders.com/resi-e-rimborsi"
      />
      
      <div className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alla Galleria
          </Link>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : error ? (
            <div className="text-destructive">Errore nel caricamento della pagina</div>
          ) : page ? (
            <div className="prose prose-slate max-w-none">
              {renderContent(page.content)}
            </div>
          ) : (
            <div className="text-muted-foreground">Contenuto non trovato</div>
          )}

          <div className="mt-12 p-6 bg-muted/50 rounded-lg">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Hai bisogno di assistenza?
            </h3>
            <p className="text-muted-foreground mb-4">
              Contattaci per qualsiasi domanda sui resi e rimborsi:
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={handleWhatsAppClick}
                className="bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button 
                variant="outline"
                onClick={handleEmailClick}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ResiRimborsi;
