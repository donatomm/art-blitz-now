import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, ShoppingBag, Loader2, AlertCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useStaticSiteSettings } from "@/hooks/useStaticSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import { isPaidReceipt } from "@/lib/checkoutReceipt";

const CheckoutSuccess = () => {
  const { completeCheckout, isCartLoaded } = useCart();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id") || "";
  const [status, setStatus] = useState<"checking" | "paid" | "pending" | "expired" | "error" | "missing">("checking");
  const [retry, setRetry] = useState(0);
  const [confirmedSessionId, setConfirmedSessionId] = useState("");
  const settings = useStaticSiteSettings();
  const whatsappNumber = settings.hellobar_whatsapp_number || '393666295174';
  const contactEmail = settings.hellobar_contact_email || 'info@octowonders.com';

  useEffect(() => {
    if (!/^cs_(test_|live_)?[A-Za-z0-9]{6,}$/.test(sessionId)) {
      setStatus("missing");
      return;
    }
    let cancelled = false;
    setStatus("checking");
    void (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-checkout", {
          body: { session_id: sessionId }, signal: AbortSignal.timeout(15000),
        });
        if (cancelled) return;
        if (error || data?.error) throw new Error("Confirmation unavailable");
        if (isPaidReceipt(data, sessionId)) {
          setConfirmedSessionId(sessionId);
          setStatus("paid");
        }
        else if (data?.status === "pending" || data?.status === "expired") setStatus(data.status);
        else setStatus("error");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => { cancelled = true; };
  }, [sessionId, retry]);

  useEffect(() => {
    if (status === "paid" && confirmedSessionId === sessionId && isCartLoaded) completeCheckout(sessionId);
  }, [status, sessionId, confirmedSessionId, completeCheckout, isCartLoaded]);

  const messages = {
    checking: ["Verifica del pagamento", "Stiamo verificando il pagamento e registrando il tuo ordine."],
    paid: ["Grazie per il tuo ordine!", "Il pagamento è stato verificato e il tuo ordine è stato registrato."],
    pending: ["Pagamento in attesa", "Il pagamento non è ancora confermato. Il tuo carrello è stato conservato."],
    expired: ["Sessione di pagamento scaduta", "Questo pagamento non è stato confermato. Puoi ripartire dal carrello."],
    error: ["Conferma temporaneamente non disponibile", "Non possiamo ancora confermare il pagamento. Non ripetere l'acquisto: riprova la verifica o contattaci. Il carrello è stato conservato."],
    missing: ["Nessun pagamento da verificare", "Questo indirizzo non contiene un riferimento di pagamento valido. Il tuo carrello è stato conservato."],
  } as const;

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Verifica ordine" description="Verifica del pagamento e dell'ordine su OctoWonders." noindex={true} />
      <Navigation />

      <div className="container mx-auto px-4 pt-32 pb-12">
        <div className="max-w-lg mx-auto text-center space-y-6">
          <div className="flex justify-center">
            {status === "paid" ? <CheckCircle className="h-20 w-20 text-green-500" /> :
              status === "checking" ? <Loader2 className="h-20 w-20 animate-spin" /> :
              <AlertCircle className="h-20 w-20 text-muted-foreground" />}
          </div>

          <h1 className="text-3xl font-bold text-foreground">{messages[status][0]}</h1>

          <p className="text-muted-foreground text-lg" role="status" aria-live="polite">
            {messages[status][1]}
          </p>
          {(status === "pending" || status === "error") &&
            <Button onClick={() => setRetry(value => value + 1)}>Verifica di nuovo</Button>}

          {status === "paid" && <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Prossimi passi:</h2>
            <ul className="text-left text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-gold">•</span>
                <span>Il tuo ordine è registrato. Per informazioni puoi contattarci qui sotto.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold">•</span>
                <span>La tua opera sarà preparata e spedita entro 3-5 giorni lavorativi</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold">•</span>
                <span>Conserva il riferimento del pagamento presente nell'indirizzo di questa pagina.</span>
              </li>
            </ul>
          </div>}

          {/* WhatsApp VIP Section */}
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-green-500/30 rounded-lg p-6 space-y-3">
            <div className="text-center space-y-2">
              <svg className="w-10 h-10 text-green-600 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
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
                  <svg className="mr-2 w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Unisciti alla Lista VIP
                </Button>
              </a>
            </div>
          </div>

          <div className="text-muted-foreground">
            <p>
              Per qualsiasi domanda <span className="font-medium text-foreground">contattami qui:</span>
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-3">
              <a
                href={`https://wa.me/${whatsappNumber}?text=Ciao%2C%20ho%20una%20domanda%20sul%20mio%20ordine`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg font-bold text-sm py-2 px-4 transition-opacity hover:opacity-90"
                style={{ background: "#25D366", color: "white" }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
              <a
                href={`mailto:${contactEmail}?subject=Domanda%20sul%20mio%20ordine`}
                className="inline-flex items-center justify-center gap-2 rounded-lg font-bold text-sm py-2 px-4 transition-opacity hover:opacity-90"
                style={{
                  background: "linear-gradient(to right, #1a1a2e, #16213e)",
                  color: "white",
                  border: "3px solid #FFD700",
                  boxShadow: "0 0 15px rgba(255,215,0,0.3)",
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
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
