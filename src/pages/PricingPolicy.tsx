import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

const PricingPolicy = () => {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16 flex flex-col">
      <Link to="/" className="fixed top-4 left-4 z-40 inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all duration-300 font-medium bg-gold text-primary opacity-75 hover:opacity-100 hover:scale-105 hover:shadow-xl">
        <ArrowLeft className="h-5 w-5" />
        <span className="hidden sm:inline">Torna alla Galleria</span>
      </Link>

      <div className="max-w-3xl mx-auto px-4 sm:px-8 md:px-16">
        <h1 className="text-3xl font-bold mb-2">Politica Prezzi</h1>
        <p className="text-muted-foreground mb-6 font-bold">Tutti i prezzi sono IVA inclusa</p>
        
        <div className="prose prose-lg max-w-none space-y-8">
          <p className="text-lg leading-relaxed text-gold-foreground">
            I prezzi delle opere dipendono dallo sconto del fornitore (stampa ed intelaiatura) quindi sono soggetti a fluttuazioni. Non appena ricevo uno sconto ve lo passo, lo applico subito al prezzo delle opere.             
          </p>

          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Aspetto e Spessore Tela/Telaio</h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Le tele vengono montate su un telaio di <strong className="text-foreground">2 cm</strong> di spessore, che ha un aspetto ottimo.
            </p>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Su richiesta, ad un prezzo sotto i <strong className="text-foreground">10 EUR</strong>, si può richiedere uno spessore di <strong className="text-foreground">4 cm</strong>. Consigliato per tele ampie, come 75x100 o 80x120.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <img src="/images/spessori-telaio.jpg" alt="Confronto spessori telaio: 2cm standard e 4cm su richiesta" className="rounded-lg shadow-md w-full" />
              <img src="/images/preview-tela-angolo.png" alt="Dettaglio angolo tela e telaio" className="rounded-lg shadow-md w-full object-cover" />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
};

export default PricingPolicy;