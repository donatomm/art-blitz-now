import { MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageContent from "@/components/PageContent";

const Contact = () => {
  const whatsappMessage = `Ciao, mi chiamo .......
Ed ho le seguenti domande:

`;
  const whatsappLink = `https://wa.me/393666295174?text=${encodeURIComponent(whatsappMessage)}`;
  const emailLink = `mailto:me@octowonders.com?subject=${encodeURIComponent("Domanda")}&body=${encodeURIComponent(whatsappMessage)}`;

  return (
    <PageContent slug="contatti">
      {/* Contact Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button
          asChild
          variant="cta"
          size="lg"
          className="flex-1 h-14 text-lg"
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
    </PageContent>
  );
};

export default Contact;
