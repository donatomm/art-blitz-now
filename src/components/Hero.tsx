import { useState } from "react";
import TrustBar from "./TrustBar";
import heroImage from "@/assets/hero-image.webp";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MessageCircle, Mail } from "lucide-react";
interface HeroProps {
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  trustBarItems?: string[];
}
const Hero = ({
  imageUrl = heroImage,
  title = "Your Hero Title Here",
  subtitle = "Your inspiring subtitle goes here",
  ctaText,
  onCtaClick,
  trustBarItems
}: HeroProps) => {
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false);
  return <>
      <section className="relative w-full overflow-hidden">
        {/* Background Image with high priority for LCP */}
        <img src={imageUrl} alt="OctoWonders Hero" width={1920} height={1080} loading="eager" decoding="sync" fetchPriority="high" className="absolute inset-0 w-full h-full object-cover object-center" />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Main Content */}
        <div className="relative z-10 flex flex-col">
          {/* Shipping info - centered under nav */}
          <div className="flex justify-center pt-20">
            <div className="flex items-center gap-2 text-white text-sm font-medium">
              <span className="text-center text-gold">SPEDIZIONE GRATUITA in Italia
- 30% fino a capodanno!</span>
              <button onClick={() => setShippingDialogOpen(true)} className="px-2 py-0.5 text-xs rounded transition-colors bg-transparent hover:bg-white/10 text-white border border-primary-foreground">
                Dettagli
              </button>
            </div>
          </div>

          {/* Hero Text Area */}
          <div className="flex h-[calc(65vh-20px)] min-h-[400px] flex-col items-center justify-center px-4 text-center">
            <div className="bg-blue-500/40 backdrop-blur-sm px-8 py-6 rounded-lg border border-white/10">
              <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl whitespace-pre-line">
                {title}
              </h1>
              <p className="max-w-2xl mx-auto text-center text-lg italic text-gold sm:text-xl md:text-2xl">
                {subtitle}
              </p>
              {ctaText && <button onClick={onCtaClick} className="mt-6 px-8 py-3 font-semibold rounded-full transition-all duration-200 hover:scale-105 text-lg text-primary-foreground bg-green-600 hover:bg-green-500">
                  {ctaText}
                </button>}
            </div>
          </div>

          {/* Trust Bar - positioned at bottom of hero */}
          <div className="pb-4">
            <TrustBar items={trustBarItems} />
          </div>
        </div>
      </section>

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
    </>;
};
export default Hero;