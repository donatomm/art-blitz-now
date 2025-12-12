import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PricingPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna alla Galleria
          </Link>

          <h1 className="text-3xl font-bold mb-8">Politica Prezzi</h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <p className="text-lg text-muted-foreground leading-relaxed">
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
                <img 
                  src="/images/spessori-telaio.jpg" 
                  alt="Confronto spessori telaio: 2cm standard e 4cm su richiesta" 
                  className="rounded-lg shadow-md w-full"
                />
                <img 
                  src="/images/preview-tela-angolo.png" 
                  alt="Dettaglio angolo tela e telaio" 
                  className="rounded-lg shadow-md w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPolicy;
