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
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed">
              I prezzi delle opere dipendono dallo sconto del fornitore (stampa ed intelaiatura) quindi sono soggetti a fluttuazioni. Non appena ricevo uno sconto ve lo passo, lo applico subito al prezzo delle opere.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPolicy;
