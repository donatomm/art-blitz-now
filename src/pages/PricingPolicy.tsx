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
              I prezzi delle opere dipendono dallo sconto del fornitore (stampa ed intelaiatura) quindi sono soggetti a fluttuazioni. Quelli presenti sono <strong className="text-foreground">MOLTO scontati</strong>, abbassando il prezzo delle opere di oltre il <strong className="text-foreground">30%</strong> e sono validi sino al <strong className="text-foreground">12 Dicembre</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPolicy;
