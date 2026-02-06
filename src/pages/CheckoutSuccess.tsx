import { Link } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, ShoppingBag, MessageCircle, Mail } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useStaticSiteSettings } from "@/hooks/useStaticSiteSettings";

const CheckoutSuccess = () => {
  const { clearCart } = useCart();
  const settings = useStaticSiteSettings();
  const whatsappNumber = settings.hellobar_whatsapp_number;
  const contactEmail = settings.hellobar_contact_email;

  // Clear cart on successful checkout
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Ordine Completato" description="Grazie per il tuo ordine su OctoWonders." noindex={true} />
      <Navigation />

      <div className="container mx-auto px-4 pt-32 pb-12">
        <div className="max-w-lg mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>

          <h1 className="text-3xl font-bold text-foreground">Grazie per il tuo ordine!</h1>

          <p className="text-muted-foreground text-lg">
            Il pagamento è stato elaborato con successo. Riceverai una email di conferma a breve.
          </p>

          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Prossimi passi:</h2>
            <ul className="text-left text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-gold">•</span>
                <span>Riceverai un'email di conferma con i dettagli dell'ordine</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold">•</span>
                <span>La tua opera sarà preparata e spedita entro 3-5 giorni lavorativi</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold">•</span>
                <span>Riceverai il tracking della spedizione via email</span>
              </li>
            </ul>
          </div>

          {/* WhatsApp VIP Section */}
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-green-500/30 rounded-lg p-6 space-y-3">
            <div className="text-center space-y-2">
              <MessageCircle className="h-10 w-10 text-green-600 mx-auto" />
              <h2 className="text-xl font-bold text-foreground">Lista VIP WhatsApp</h2>
              <p className="text-sm text-foreground">
                Nuove opere in anteprima.
                <br />
                Offerte esclusive 24h prima di tutti.
              </p>
              <a
                href={`https://wa.me/${whatsappNumber}?text=VIP`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button variant="cta">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Unisciti alla Lista VIP
                </Button>
              </a>
            </div>
          </div>

          <div className="text-muted-foreground">
            <p>
              Per qualsiasi domanda <span className="font-medium text-foreground">contattami qui:</span>
            </p>
            <div className="flex justify-center gap-4 mt-3">
              <a
                href={`https://wa.me/${whatsappNumber}?text=Ciao%2C%20ho%20una%20domanda%20sul%20mio%20ordine`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                <span>WhatsApp</span>
              </a>
              <a
                href={`mailto:${contactEmail}?subject=Domanda%20sul%20mio%20ordine`}
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span>Email</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/">
              <Button className="w-full sm:w-auto bg-gold text-black hover:bg-gold/90">
                <Home className="mr-2 h-4 w-4" />
                Torna alla Home
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Esplora altre opere
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
