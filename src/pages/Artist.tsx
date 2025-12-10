import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Artist = () => {
  const whatsappNumber = "+393666295174";
  const whatsappMessage = encodeURIComponent("Ciao! Ho una domanda");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
  const emailLink = `mailto:me@octowonders.com?subject=Domanda`;

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      {/* Back to Gallery button */}
      <Link to="/" className="fixed top-4 left-4 z-40 inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all duration-300 font-medium bg-gold text-primary opacity-75 hover:opacity-100 hover:scale-105 hover:shadow-xl">
        <ArrowLeft className="h-5 w-5" />
        <span className="hidden sm:inline">Torna alla Galleria</span>
      </Link>
      
      <div className="max-w-[700px] mx-auto px-4 sm:px-8 md:px-16">
        
        <h1 className="text-4xl font-bold text-black mb-8">Chi Sono</h1>
        
        <p className="text-lg leading-relaxed text-foreground mb-8">
          Ciao, sono <strong>Marco De Francesco</strong> — che è uno pseudonimo :-)
        </p>

        {/* L'Arte che Non Si Ferma */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">
            L'Arte che Non Si Ferma
          </h2>
          <p className="text-lg leading-relaxed text-foreground">
            Da anni mi diletto a creare elaborati scarabocchi. Poi per caso ho iniziato con le cose che amo, i polpi, i pesci, il mare e le sue creature.
          </p>
          <p className="text-lg leading-relaxed text-foreground mt-4">
            Passaggio dopo passaggio, ne è venuta fuori qualcuna che ha impressionato i miei amici. Incredibile!
          </p>
          <p className="text-lg leading-relaxed text-foreground mt-4">
            Di giorno sono un Product Marketer nel mondo tech. Di notte (letteralmente) creo queste opere che vedete su OctoWonders.
          </p>
        </section>

        {/* Perché Condividere */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">
            Perché Condividere
          </h2>
          <p className="text-lg leading-relaxed text-foreground">
            In tanti mi hanno spinto a condividere le mie creazioni.
          </p>
          <p className="text-lg leading-relaxed text-foreground mt-4">
            <strong>Mi hanno convinto con un'idea semplice:</strong> l'arte non è arte se resta chiusa in un cassetto. Va condivisa, vissuta, appesa al muro di qualcuno che se la può godere.
          </p>
        </section>

        {/* Un'Operazione Artigianale */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">
            Un'Operazione Artigianale
          </h2>
          <p className="text-lg leading-relaxed text-foreground mb-4">
            Questa è un'operazione artigianale al 100%.
          </p>
          <p className="text-lg leading-relaxed text-foreground mb-4">
            Ho messo su questo sito facendo le ore piccole, tra una call di lavoro e l'altra. Perdonatemi per qualche problemino tecnico — sono un marketer, non uno sviluppatore :-)
          </p>
          <p className="text-lg leading-relaxed text-foreground mb-4">
            Mancherà qualche parte, ma ci sto già lavorando su
          </p>
          <p className="text-lg leading-relaxed text-foreground mb-2">
            <strong>Ma sulla qualità non scendo a compromessi:</strong>
          </p>
          <ul className="list-disc list-inside text-lg leading-relaxed text-foreground space-y-2 ml-4">
            <li>Ogni opera è creata con tecniche manuali e digitali in sequenza</li>
            <li><strong>Zero AI, 0%</strong> — solo il mio occhio, le mie mani, la mia visione</li>
            <li>Stampe professionali su tela con tecnologia HP Latex</li>
            <li>Colori brillanti garantiti 70 anni, e resistenti alla luce</li>
            <li>Pronte da appendere!</li>
          </ul>
        </section>

        {/* Pagamenti Sicuri */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">
            Pagamenti Sicuri
          </h2>
          <p className="text-lg leading-relaxed text-foreground">
            Niente preoccupazione per i pagamenti: uso <strong>Stripe</strong>, lo standard mondiale per transazioni online sicure. Le stesse tecnologie che usano Amazon, Shopify, e migliaia di aziende globali.
          </p>
        </section>

        {/* Chi Ha Già Le Mie Opere */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">
            Chi Ha Già Le Mie Opere
          </h2>
          <p className="text-lg leading-relaxed text-foreground">
            Sto creando una sezione per recensioni, ma posso anticiparti che chi ha le mie opere in giro per l'Italia e l'Europa è rimasto molto contento/a.
          </p>
        </section>

        {/* Divider */}
        <hr className="my-8 border-border" />

        {/* Enjoy e Buone Feste */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">
            Enjoy e Buone Feste! 🎄
          </h2>
          <p className="text-lg leading-relaxed text-foreground">
            Se hai domande, dubbi, o vuoi semplicemente dirmi cosa ne pensi — scrivimi. Rispondo sempre.
          </p>
        </section>

        {/* Contact Buttons */}
        <div className="flex flex-wrap gap-4 mt-8">
          <Button
            asChild
            className="bg-green-600 hover:bg-green-500 text-white"
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

        {/* Work in Progress Section */}
        <section className="mt-16 pt-8 border-t border-border">
          <h2 className="text-2xl font-semibold text-primary mb-4">
            🚧 WORK IN PROGRESS
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-4 font-semibold text-foreground">File</th>
                  <th className="py-2 font-semibold text-foreground">Descrizione</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-mono text-sm">privacy-policy-octowonders.docx</td>
                  <td className="py-2">Privacy Policy in formato Word</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-mono text-sm">privacy-policy-octowonders.html</td>
                  <td className="py-2">Versione HTML pronta per il tuo sito</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-4 font-mono text-sm">termini-e-condizioni-vendita.docx</td>
                  <td className="py-2">Termini e Condizioni conformi al Codice del Consumo</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-sm">cookie-policy-base.docx</td>
                  <td className="py-2">Cookie Policy base (solo tecnici, no banner)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Artist;
