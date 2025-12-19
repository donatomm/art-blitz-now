import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MessageCircle, Mail } from 'lucide-react';

const HelloBar = () => {
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false);

  return (
    <>
      {/* Simple shipping info bar */}
      <div className="fixed top-16 left-0 right-0 z-40 w-full bg-green-600 flex items-center justify-center px-4 py-1.5">
        <p className="text-sm font-medium flex items-center gap-2 text-white">
          <span>SPEDIZIONE GRATUITA</span>
          <button
            onClick={() => setShippingDialogOpen(true)}
            className="ml-1 px-2 py-0.5 text-xs rounded transition-colors bg-green-300 hover:bg-green-200 text-green-900"
          >
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
            
            <p className="text-sm text-muted-foreground mt-4">
              Per spedizioni in altre zone (Sardegna, isole minori, Paesi Europei), i costi di produzione sono significativamente più alti (diverso fornitore) mentre lo shipping rientra nella norma, ed offre consegna ESPRESSA 24h
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Paesi inclusi: DE, AT, CH, LU, GB, IE, FR, BE, ES, SE, DK, FI, NL, PL, PT, CZ, HU, SK.
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              <strong className="text-foreground">EXPRESS 24h</strong>. Contattaci per un preventivo personalizzato.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://wa.me/393666295174?text=Ciao!%20Vorrei%20un%20preventivo%20per%20spedizione%20in%20zona%20non%20coperta%20dalla%20spedizione%20gratuita."
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm font-medium"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href="mailto:info@octowonders.com?subject=Richiesta%20preventivo%20spedizione"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md transition-colors text-sm font-medium"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HelloBar;