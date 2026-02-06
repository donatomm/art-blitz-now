import PageContent from "@/components/PageContent";
import { useStaticSiteSettings } from "@/hooks/useStaticSiteSettings";

const Contact = () => {
  const settings = useStaticSiteSettings();
  const whatsappNumber = settings.hellobar_whatsapp_number;
  const contactEmail = settings.hellobar_contact_email;

  const whatsappMessage = `Ciao, mi chiamo .......
Ed ho le seguenti domande:

`;
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
    : null;
  const emailLink = contactEmail
    ? `mailto:${contactEmail}?subject=${encodeURIComponent("Domanda")}&body=${encodeURIComponent(whatsappMessage)}`
    : null;

  return (
    <PageContent 
      slug="contatti"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Contatti", url: "/contatti" },
      ]}
    >
      {/* Contact Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg font-bold text-lg py-4 px-6 transition-opacity hover:opacity-90"
            style={{ background: "#25D366", color: "white" }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
        )}
        {emailLink && (
          <a
            href={emailLink}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg font-bold text-lg py-4 px-6 transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(to right, #1a1a2e, #16213e)",
              color: "white",
              border: "3px solid #FFD700",
              boxShadow: "0 0 15px rgba(255,215,0,0.3)",
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </a>
        )}
      </div>
    </PageContent>
  );
};

export default Contact;
