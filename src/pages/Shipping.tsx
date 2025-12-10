import Navigation from "@/components/Navigation";
import { MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const Shipping = () => {
  const whatsappLink = `https://wa.me/393666295174?text=${encodeURIComponent("Ciao! Ho una domanda sulla spedizione")}`;
  const emailLink = `mailto:me@octowonders.com?subject=${encodeURIComponent("Domanda Spedizione")}`;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-[800px] mx-auto px-4 py-8 md:px-8 md:py-16 pt-24">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          Regole di Spedizione
        </h1>

        {/* Christmas Deadline Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            🎄 Consegna Garantita per Natale SE:
          </h2>
          <p className="text-lg leading-relaxed text-foreground">
            ⚡ <strong className="font-bold">COMPLETA L'ACQUISTO ENTRO IL 14 DICEMBRE 2025</strong>
          </p>
          <p className="text-lg leading-relaxed text-foreground mt-2">
            ✅ <strong className="font-bold">Inserisci l'indirizzo di spedizione con precisione</strong> - controlla due volte prima di confermare
          </p>
        </section>

        <hr className="border-border my-8" />

        {/* Delivery Times Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            ⏱️ Tempi di Consegna
          </h2>
          <p className="text-lg leading-relaxed text-foreground mb-3">
            <strong className="font-bold">La tua opera sarà:</strong>
          </p>
          <ul className="list-disc list-inside text-lg leading-relaxed text-foreground space-y-2 ml-4">
            <li>Stampata su tela in <strong className="font-bold">24 ore</strong></li>
            <li>Consegnata in <strong className="font-bold">3-5 giorni lavorativi</strong></li>
          </ul>
          <p className="text-lg leading-relaxed text-muted-foreground mt-4">
            Ogni stampa è imballata professionalmente con materiali protettivi per garantire che arrivi in perfette condizioni.
          </p>
        </section>

        <hr className="border-border my-8" />

        {/* Shipping Costs Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            🚚 Costi di Spedizione
          </h2>
          <p className="text-lg leading-relaxed text-foreground mb-3">
            <strong className="font-bold">GRATIS</strong> per Italia Peninsulare e Sicilia
          </p>
          <p className="text-lg leading-relaxed text-foreground mb-3">
            <strong className="font-bold">Sardegna:</strong> Ci stiamo attrezzando - contattaci per verificare disponibilità
          </p>
          <p className="text-lg leading-relaxed text-foreground mb-2">
            <strong className="font-bold">Altri Paesi UE:</strong> Contattaci prima dell'acquisto in quanto:
          </p>
          <ul className="list-disc list-inside text-lg leading-relaxed text-foreground space-y-2 ml-4">
            <li>Corriere diverso richiesto</li>
            <li>Costi maggiorati (circa il doppio)</li>
            <li>Disponibile UPS EXPRESS (consegna in 24h)</li>
          </ul>
        </section>

        <hr className="border-border my-8" />

        {/* Refunds Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            🔄 Rimborsi
          </h2>
          <p className="text-lg leading-relaxed text-foreground mb-3">
            Vogliamo che tu ami la tua opera.
          </p>
          <p className="text-lg leading-relaxed text-foreground mb-2">
            <strong className="font-bold">Se non sei soddisfatto:</strong>
          </p>
          <ul className="list-disc list-inside text-lg leading-relaxed text-foreground space-y-2 ml-4">
            <li>Contattaci entro <strong className="font-bold">14 giorni dalla consegna</strong></li>
            <li>Ti rimborseremo o sostituiremo l'opera</li>
          </ul>
          <p className="text-lg leading-relaxed text-muted-foreground mt-4">
            <strong className="font-bold">Nota:</strong> Gli ordini personalizzati (dimensioni non standard) non sono rimborsabili.
          </p>
        </section>

        <hr className="border-border my-8" />

        {/* Contact Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            📞 Hai Domande?
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground mb-6">
            Rispondiamo al più presto, e comunque entro 24 ore.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
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
        </section>
      </main>
    </div>
  );
};

export default Shipping;
