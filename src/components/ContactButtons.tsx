import { MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStaticSiteSettings } from "@/hooks/useStaticSiteSettings";

interface ContactButtonsProps {
  whatsappMessage?: string;
  emailSubject?: string;
  emailBody?: string;
}

const ContactButtons = ({
  whatsappMessage = "Ciao! Ho una domanda...",
  emailSubject = "Richiesta informazioni",
  emailBody = "Ciao!\n\nHo una domanda:\n\n",
}: ContactButtonsProps) => {
  const settings = useStaticSiteSettings();
  const whatsappNumber = settings.hellobar_whatsapp_number;
  const contactEmail = settings.hellobar_contact_email;

  if (!whatsappNumber && !contactEmail) return null;

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
    : null;

  const emailLink = contactEmail
    ? `mailto:${contactEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    : null;

  return (
    <div className="flex flex-col sm:flex-row gap-3 my-6">
      {whatsappLink && (
        <Button asChild variant="cta" className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white border-0">
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-5 w-5" />
            WhatsApp
          </a>
        </Button>
      )}
      {emailLink && (
        <Button
          asChild
          variant="secondary"
          className="flex-1 bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white hover:opacity-90 border-[3px] border-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.3)]"
        >
          <a href={emailLink}>
            <Mail className="mr-2 h-5 w-5" />
            Email
          </a>
        </Button>
      )}
    </div>
  );
};

export default ContactButtons;
