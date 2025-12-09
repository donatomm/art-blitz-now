import PageContent from "@/components/PageContent";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail } from "lucide-react";

const Contact = () => {
  const getWhatsAppLink = () => {
    const message = encodeURIComponent("Ciao! Vorrei informazioni sulle vostre opere.");
    return `https://wa.me/393666295174?text=${message}`;
  };

  const getEmailLink = () => {
    const subject = encodeURIComponent("Richiesta informazioni");
    return `mailto:?subject=${subject}`;
  };

  return (
    <PageContent slug="contatti">
      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <Button
          asChild
          size="lg"
          className="h-auto py-6 flex-col gap-2"
        >
          <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-8 w-8" />
            <span className="text-lg font-semibold">WhatsApp</span>
            <span className="text-sm opacity-80">Risposta rapida</span>
          </a>
        </Button>
        
        <Button
          asChild
          variant="secondary"
          size="lg"
          className="h-auto py-6 flex-col gap-2"
        >
          <a href={getEmailLink()}>
            <Mail className="h-8 w-8" />
            <span className="text-lg font-semibold">Email</span>
            <span className="text-sm opacity-80">Per richieste dettagliate</span>
          </a>
        </Button>
      </div>
    </PageContent>
  );
};

export default Contact;
