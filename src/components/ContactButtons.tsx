import { useStaticSiteSettings } from "@/hooks/useStaticSiteSettings";

interface ContactButtonsProps {
  whatsappMessage?: string;
  emailSubject?: string;
  emailBody?: string;
}

const ContactButtons = ({
  whatsappMessage = "Ciao! Ho una domanda...",
  emailSubject = "Richiesta informazioni",
  emailBody = "Ciao!\n\nHo una domanda:\n\n"
}: ContactButtonsProps) => {
  const settings = useStaticSiteSettings();
  const whatsappNumber = settings.hellobar_whatsapp_number;
  const contactEmail = settings.hellobar_contact_email;

  if (!whatsappNumber && !contactEmail) return null;

  const whatsappLink = whatsappNumber ?
  `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}` :
  null;

  const emailLink = contactEmail ?
  `mailto:${contactEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}` :
  null;

  return (
    <div className="flex flex-col sm:flex-row gap-3 my-6">
      {whatsappLink












      }
      {emailLink &&
      <a
        href={emailLink}
        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg font-bold text-base py-3 px-5 transition-opacity hover:opacity-90"
        style={{
          background: "linear-gradient(to right, #1a1a2e, #16213e)",
          color: "white",
          border: "3px solid #FFD700",
          boxShadow: "0 0 15px rgba(255,215,0,0.3)"
        }}>

          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email
        </a>
      }
    </div>);

};

export default ContactButtons;