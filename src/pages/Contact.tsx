import { Link } from "react-router-dom";
import { MessageCircle, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePage } from "@/hooks/usePages";
import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Contact = () => {
  const { data: pageData, isLoading } = usePage("contatti");
  
  const whatsappMessage = `Ciao, mi chiamo .......
Ed ho le seguenti domande:

`;
  const whatsappLink = `https://wa.me/393666295174?text=${encodeURIComponent(whatsappMessage)}`;
  const emailLink = `mailto:me@octowonders.com?subject=${encodeURIComponent("Domanda")}&body=${encodeURIComponent(whatsappMessage)}`;

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let listType: 'ul' | 'ol' | null = null;

    const flushList = () => {
      if (listItems.length > 0 && listType) {
        const ListTag = listType === 'ul' ? 'ul' : 'ol';
        elements.push(
          <ListTag key={elements.length} className={`${listType === 'ul' ? 'list-disc' : 'list-decimal'} list-inside text-lg leading-relaxed text-foreground space-y-2 ml-4 mb-4`}>
            {listItems.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />)}
          </ListTag>
        );
        listItems = [];
        listType = null;
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('## ')) {
        flushList();
        elements.push(<h2 key={index} className="text-2xl font-semibold text-foreground mb-4 mt-8">{trimmedLine.substring(3)}</h2>);
      } else if (trimmedLine.startsWith('# ')) {
        flushList();
        elements.push(<h1 key={index} className="text-4xl font-bold text-foreground mb-6">{trimmedLine.substring(2)}</h1>);
      } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        if (listType !== 'ul') flushList();
        listType = 'ul';
        listItems.push(trimmedLine.substring(2));
      } else if (/^\d+\.\s/.test(trimmedLine)) {
        if (listType !== 'ol') flushList();
        listType = 'ol';
        listItems.push(trimmedLine.replace(/^\d+\.\s/, ''));
      } else if (trimmedLine === '---') {
        flushList();
        elements.push(<hr key={index} className="my-8 border-border" />);
      } else if (trimmedLine) {
        flushList();
        const processedLine = trimmedLine
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer">$1</a>');
        elements.push(<p key={index} className="text-lg leading-relaxed text-foreground mb-4" dangerouslySetInnerHTML={{ __html: processedLine }} />);
      }
    });
    
    flushList();
    return elements;
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 flex flex-col">
      <SEO 
        title={pageData?.seo_title || "Contattaci"}
        description={pageData?.seo_description || "Contatta OctoWonders via WhatsApp o Email per domande sulle opere, ordini personalizzati o assistenza."}
        url="/contact"
      />
      
      <Link to="/" className="fixed top-4 left-4 z-40 inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all duration-300 font-medium bg-gold text-primary opacity-75 hover:opacity-100 hover:scale-105 hover:shadow-xl">
        <ArrowLeft className="h-5 w-5" />
        <span className="hidden sm:inline">Torna alla Galleria</span>
      </Link>
      
      <main className="max-w-[700px] mx-auto px-4 sm:px-8 md:px-16">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        ) : pageData?.content ? (
          <div>{renderContent(pageData.content)}</div>
        ) : (
          <p className="text-muted-foreground">Contenuto non disponibile.</p>
        )}
        
        {/* Contact Buttons - Always visible */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button
            asChild
            size="lg"
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold h-14 text-lg"
          >
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-5 w-5" />
              WhatsApp
            </a>
          </Button>
          
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-black font-bold h-14 text-lg"
          >
            <a href={emailLink}>
              <Mail className="mr-2 h-5 w-5" />
              Email
            </a>
          </Button>
        </div>
      </main>
      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
};

export default Contact;
