import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const HelloBar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      <div className={`fixed top-16 left-0 right-0 z-40 min-h-[45px] w-full bg-emerald-600 flex items-center justify-center px-4 py-2 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0 animate-vibrate' : 'opacity-0 -translate-y-full'}`}>
        <p className="text-sm font-medium flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-white text-center">
          <span className="flex items-center gap-1">
            SPEDIZIONE GRATUITA
            <button 
              onClick={() => setShippingDialogOpen(true)}
              className="ml-1 px-2 py-0.5 text-xs bg-white/20 hover:bg-white/30 rounded transition-colors"
            >
              Dettagli
            </button>
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1">
            CONSEGNA ENTRO NATALE GARANTITA PER ACQUISTI ENTRO 14 Dicembre
            <button 
              onClick={() => setDeliveryDialogOpen(true)}
              className="ml-1 px-2 py-0.5 text-xs bg-white/20 hover:bg-white/30 rounded transition-colors"
            >
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
              <li>Italia peninsulare</li>
              <li>Sicilia</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              Per spedizioni in altre zone (Sardegna, isole minori, UE), i costi di spedizione sono significativamente più alti. Contattaci per un preventivo personalizzato.
            </p>
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
            <p className="text-sm text-muted-foreground">
              Gli ordini effettuati dopo questa data potrebbero non arrivare in tempo per le festività natalizie.
            </p>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HelloBar;
