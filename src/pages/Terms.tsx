import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Termini e Condizioni"
        description="Termini e condizioni di vendita di OctoWonders. Leggi le condizioni di acquisto, spedizione e reso."
        url="/terms"
      />
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-8 pt-24 pb-12 max-w-4xl">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna alla Galleria
        </Link>

        <div className="text-center py-16">
          <h1 className="text-3xl font-bold text-foreground mb-4">📄 Termini e Condizioni di Vendita</h1>
          <p className="text-muted-foreground mb-8">
            Scarica il documento completo con i termini e le condizioni di vendita di OctoWonders.
          </p>
          
          <Button asChild size="lg" className="gap-2">
            <a href="/docs/termini-e-condizioni.pdf" download>
              <Download className="h-5 w-5" />
              Scarica PDF
            </a>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;
