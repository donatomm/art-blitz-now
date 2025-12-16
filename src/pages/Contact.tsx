import { Link } from "react-router-dom";
import { MessageCircle, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { usePage } from "@/hooks/usePages";
import { Skeleton } from "@/components/ui/skeleton";

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

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('# ')) {
        elements.push(<h1 key={index} className="text-4xl font-bold text-foreground mb-6">{trimmedLine.substring(2)}</h1>);
      } else if (trimmedLine) {
        const processedLine = trimmedLine
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer">$1</a>');
        elements.push(<p key={index} className="text-lg leading-relaxed text-foreground mb-4" dangerouslySetInnerHTML={{ __html: processedLine }} />);
      }
    });
    
    return elements;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <Link to="/" className="fixed top-4 left-4 z-40 inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all duration-300 font-medium bg-gold text-primary opacity-75 hover:opacity-100 hover:scale-105 hover:shadow-xl">
        <ArrowLeft className="h-5 w-5" />
        <span className="hidden sm:inline">Torna alla Galleria</span>
      </Link>
      
      <main className="max-w-[700px] mx-auto px-4 py-8 md:px-8 md:py-16 pt-24">
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
    </div>
  );
};

export default Contact;
