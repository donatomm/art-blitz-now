import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MessageCircle, Mail } from 'lucide-react';
const HelloBar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 1,
    hours: 3,
    minutes: 59,
    seconds: 0,
    expired: false
  });
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Absolute countdown to December 14, 2025 23:59:59
  useEffect(() => {
    const targetTime = new Date(2025, 11, 15, 23, 59, 59); // Dec 15, 2025 23:59:59

    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = targetTime.getTime() - now.getTime();
      if (diff <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true
        };
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(diff % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
      const minutes = Math.floor(diff % (1000 * 60 * 60) / (1000 * 60));
      const seconds = Math.floor(diff % (1000 * 60) / 1000);
      return {
        days,
        hours,
        minutes,
        seconds,
        expired: false
      };
    };
    setCountdown(calculateTimeLeft());
    const interval = setInterval(() => {
      setCountdown(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const formatTime = (n: number) => n.toString().padStart(2, '0');
  return <>
      {/* Green bar - Shipping + Christmas countdown */}
      <div className={`fixed top-16 left-0 right-0 z-40 w-full bg-green-600 flex items-center justify-center px-4 py-1.5 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0 animate-vibrate' : 'opacity-0 -translate-y-full'}`}>
        <p className="text-sm font-medium flex items-center gap-2 text-white flex-wrap justify-center">
          <span className="text-gold text-lg text-right font-normal">SCONTO 40% & Consegna GARANTITA per Natale per ordini entro</span>
          {!countdown.expired ? <span className="bg-red-600 px-2 py-0.5 rounded font-bold">
              {formatTime(countdown.hours)}:{formatTime(countdown.minutes)}:{formatTime(countdown.seconds)}
            </span> : <span className="bg-red-600 px-2 py-0.5 rounded font-bold">Scaduto</span>}
          <span className="mx-1">|</span>
          <span>SPEDIZIONE GRATUITA</span>
          <button onClick={() => setShippingDialogOpen(true)} className="ml-1 px-2 py-0.5 text-xs rounded transition-colors bg-green-300 hover:bg-green-200 text-green-900">
            Dettagli
          </button>
        </p>
      </div>


      {/* Shipping Details Modal */}
      <Dialog open={shippingDialogOpen} onOpenChange={setShippingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Spedizione Gratuita</DialogTitle>
          </DialogHeader>
          <DialogDescription className="space-y-3 text-foreground">
            <p>La spedizione gratuita è valida per:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>𝙄𝙩𝙖𝙡𝙞𝙖 𝙋𝙚𝙣𝙞𝙣𝙨𝙪𝙡𝙖𝙧𝙚 𝙚 𝙎𝙞𝙘𝙞𝙡𝙞𝙖</li>
            </ul>
            
            <p className="text-sm text-muted-foreground mt-4">Per spedizioni in altre zone (Sardegna, isole minori, Paesi Europei), i costi di produzione sono significativamente più alti (diverso fornitore) mentre lo shipping rientra nella norma, ed offre consegna ESPRESSA 24h</p>
            <p className="text-sm text-muted-foreground mt-2">
              Paesi inclusi: DE, AT, CH, LU, GB, IE, FR, BE, ES, SE, DK, FI, NL, PL, PT, CZ, HU, SK.
            </p>
            <p className="text-sm text-muted-foreground mt-3">
            <strong className="text-foreground">EXPRESS 24h</strong>. Contattaci per un preventivo personalizzato.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="https://wa.me/393666295174?text=Ciao!%20Vorrei%20un%20preventivo%20per%20spedizione%20in%20zona%20non%20coperta%20dalla%20spedizione%20gratuita." target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm font-medium">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <a href="mailto:info@octowonders.com?subject=Richiesta%20preventivo%20spedizione" className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md transition-colors text-sm font-medium">
                <Mail className="h-4 w-4" />
                Email
              </a>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>

      {/* Delivery Details Modal */}
      <Dialog open={deliveryDialogOpen} onOpenChange={setDeliveryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Consegna Garantita entro Natale</DialogTitle>
          </DialogHeader>
          <DialogDescription className="space-y-3 text-foreground">
            <p>Per ricevere il tuo ordine <strong>prima di Natale</strong>, assicurati di completare l'acquisto entro:</p>
            <p className="text-xl font-bold text-center py-2">14 Dicembre 2025</p>
            {(() => {
            const deadline = new Date(2025, 11, 14, 23, 59, 59);
            const now = new Date();
            const diffTime = deadline.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 0) {
              return <p className="text-center text-lg font-semibold text-emerald-600">
                    ⏰ Mancano solo <span className="text-2xl">{diffDays}</span> giorni!
                  </p>;
            } else if (diffDays === 0) {
              return <p className="text-center text-lg font-semibold text-orange-600">⚠️ Ultimo giorno!</p>;
            }
            return <p className="text-center text-lg font-semibold text-red-600">❌ Termine scaduto</p>;
          })()}
            <p className="text-sm text-muted-foreground">
              Gli ordini effettuati dopo questa data diffilmente arriveranno in tempo per le festività natalizie. 

A meno che per EMERGENZE non si usi un diverso fornitore che ha prezzi quasi doppi - ma consegma Express 24h. Contattatemi.
            </p>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>;
};
export default HelloBar;