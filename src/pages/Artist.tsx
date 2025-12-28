import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePage } from "@/hooks/usePages";
import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { sanitizeInlineHtml } from "@/utils/sanitizeHtml";

const Artist = () => {
  const { data: pageData, isLoading } = usePage("artista");
  
  const whatsappNumber = "+393666295174";
  const whatsappMessage = encodeURIComponent("Ciao! Ho una domanda");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
  const emailLink = `mailto:me@octowonders.com?subject=Domanda`;

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
            {listItems.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: sanitizeInlineHtml(item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')) }} />)}
          </ListTag>
        );
        listItems = [];
        listType = null;
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Check for image markdown: ![alt](url)
      const imageMatch = trimmedLine.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      
      if (imageMatch) {
        flushList();
        const altText = imageMatch[1] || 'Immagine';
        const imageUrl = imageMatch[2];
        elements.push(
          <img 
            key={index} 
            src={imageUrl} 
            alt={altText} 
            className="w-full max-w-lg mx-auto rounded-lg shadow-md my-6" 
            loading="lazy"
          />
        );
      } else if (trimmedLine.startsWith('## ')) {
        flushList();
        elements.push(<h2 key={index} className="text-2xl font-semibold text-primary mb-4 mt-8">{trimmedLine.substring(3)}</h2>);
      } else if (trimmedLine.startsWith('# ')) {
        flushList();
        elements.push(<h1 key={index} className="text-4xl font-bold text-black mb-8">{trimmedLine.substring(2)}</h1>);
      } else if (trimmedLine.startsWith('- ')) {
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
        elements.push(<p key={index} className="text-lg leading-relaxed text-foreground mb-4" dangerouslySetInnerHTML={{ __html: sanitizeInlineHtml(processedLine) }} />);
      }
    });
    
    flushList();
    return elements;
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 flex flex-col">
      <SEO 
        title={pageData?.seo_title || "Marco De Francesco - Artista"}
        description={pageData?.seo_description || "Scopri l'artista Marco De Francesco, creatore di OctoWonders. Stampe d'arte originali su tela a tema marino."}
        url="/artist"
      />
      <Link to="/" className="fixed top-4 left-4 z-40 inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all duration-300 font-medium bg-gold text-primary opacity-75 hover:opacity-100 hover:scale-105 hover:shadow-xl">
        <ArrowLeft className="h-5 w-5" />
        <span className="hidden sm:inline">Torna alla Galleria</span>
      </Link>
      
      <div className="max-w-[700px] mx-auto px-4 sm:px-8 md:px-16">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        ) : pageData?.content ? (
          <div>{renderContent(pageData.content)}</div>
        ) : (
          <p className="text-muted-foreground">Contenuto non disponibile.</p>
        )}

        {/* Contact Buttons - Always visible */}
        <div className="flex flex-wrap gap-4 mt-8">
          <Button
            asChild
            variant="cta"
          >
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </Button>
          <Button
            asChild
            variant="secondary"
            className="bg-gray-200 hover:bg-gray-300 text-black"
          >
            <a href={emailLink} className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email
            </a>
          </Button>
        </div>
      </div>
      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
};

export default Artist;
