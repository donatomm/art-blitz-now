import { useState } from "react";
import { Info, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const HelloBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="bg-green-600 text-white py-2 px-4 text-center text-sm font-medium">
        <span className="inline-flex items-center gap-2">
          🚚 SPEDIZIONE GRATUITA (Italia peninsulare e Sicilia)
          <button
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Info spedizione"
          >
            <Info className="w-3 h-3" />
          </button>
        </span>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Informazioni Spedizione</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <p className="font-semibold text-green-700 dark:text-green-300 mb-1">
                🇮🇹 Italia (Penisola e Sicilia)
              </p>
              <p className="text-green-600 dark:text-green-400">
                Spedizione GRATUITA
              </p>
            </div>
            
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <p className="font-semibold text-foreground mb-1">
                🇪🇺 Altri Paesi Europei
              </p>
              <p>
                Per spedizioni verso altri paesi EU, il costo è circa il doppio 
                a causa del cambio di fulfilment center.
              </p>
              <p className="mt-2">
                <strong>Contattami per un preventivo personalizzato.</strong>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HelloBar;
