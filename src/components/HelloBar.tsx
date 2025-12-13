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
    const targetTime = new Date(2025, 11, 14, 23, 59, 59); // Dec 14, 2025 23:59:59

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
      {/* Green bar - Shipping & Christmas */}
      <div className={`fixed top-16 left-0 right-0 z-40 w-full bg-green-600 flex flex-col items-center justify-center px-4 py-1.5 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0 animate-vibrate' : 'opacity-0 -translate-y-full'}`}>
        {/* Riga unica */}
        <p className="text-sm font-medium flex flex-wrap items-center justify-center gap-x-2 text-white text-center">
          <span className="text-center leading-tight">
            <span className="block">CONSEGNA PER 𝗡𝗔𝗧𝗔𝗟𝗘</span>
            <span className="block">GARANTITA SE ACQUISTI</span>
          </span>
          <span className="px-2 py-0.5 text-green-900 font-black text-base rounded shadow-lg animate-pulse leading-tight bg-gold">
            <span className="block">ENTRO</span>
            <span className="block">il 𝟭𝟰 𝗗𝗜𝗖𝗘𝗠𝗕𝗥𝗘</span>
          </span>
          <span className="font-medium">MANCANO</span>
          <span className="font-mono font-bold text-lg bg-black/30 px-3 py-1 rounded">
            {countdown.expired ? <span className="text-red-300">SCADUTO!</span> : <>
              <span className="text-white">{countdown.days}</span>
              <span className="text-white/70 text-sm">g </span>
              <span className="text-white">{formatTime(countdown.hours)}</span>
              <span className="text-white/70 text-sm">h </span>
              <span className="text-white">{formatTime(countdown.minutes)}</span>
              <span className="text-white/70 text-sm">m</span>
            </>}
          </span>
          <span className="flex items-center gap-1 ml-2">
            SPEDIZIONE GRATUITA
            <button onClick={() => setShippingDialogOpen(true)} className="ml-1 px-2 py-0.5 text-xs rounded transition-colors bg-green-300 hover:bg-green-200 text-green-900">
              Dettagli
            </button>
          </span>
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
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm font-medium text-emerald-800">
                Consegna Garantita entro Natale per acquisti entro il 14 dicembre.
              </p>
              <p className="text-sm text-emerald-700 mt-2">
                Gli ordini effettuati dopo questa data difficilmente arriveranno in tempo per Natale.
              </p>
              <p className="text-sm text-emerald-700 mt-2">
                A meno che per EMERGENZE non si usi un diverso fornitore che ha prezzi quasi doppi - ma consegna Express 24h. Contattatemi.
              </p>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Per spedizioni in altre zone (Sardegna, isole minori, Paesi Europei), i costi di produzione sono significativamente più alti (diverso fornitore) mentre lo shipping rientra nella norma, a parte San Marino che ha costi impossibili (mah).
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Paesi inclusi: DE, AT, CH, LU, GB, IE, FR, BE, ES, SE, DK, FI, NL, PL, PT, CZ, HU, SK.
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              Tale fornitore fa la consegna <strong className="text-foreground">EXPRESS 24h</strong>. Contattaci per un preventivo personalizzato.
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