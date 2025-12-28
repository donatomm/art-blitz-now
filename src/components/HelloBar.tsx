import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DEFAULT_POPUP_CONTENT = `📦 Spedizione Gratuita

La spedizione gratuita è valida per:

𝙄𝙩𝙖𝙡𝙞𝙖 𝙋𝙚𝙣𝙞𝙣𝙨𝙪𝙡𝙖𝙧𝙚 𝙚 𝙎𝙞𝙘𝙞𝙡𝙞𝙖

Per spedizioni in altre zone (Sardegna, isole minori, Paesi Europei), i costi di produzione sono significativamente più alti (diverso fornitore) mentre lo shipping rientra nella norma, ed offre consegna ESPRESSA 24h

Paesi inclusi: DE, AT, CH, LU, GB, IE, FR, BE, ES, SE, DK, FI, NL, PL, PT, CZ, HU, SK.

EXPRESS 24h. Contattaci per un preventivo personalizzato.`;

interface HelloBarProps {
  enabled?: boolean;
  text?: string;
  textColor?: string;
  bgColor?: string;
  countdownEnabled?: boolean;
  countdownEnd?: string;
  countdownTextColor?: string;
  countdownBgColor?: string;
  buttonText?: string;
  buttonTextColor?: string;
  buttonBgColor?: string;
  buttonBorderColor?: string;
  popupContent?: string;
  whatsappNumber?: string;
  contactEmail?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const HelloBar = ({
  enabled = true,
  text = "SPEDIZIONE GRATUITA in Italia - 30% fino a capodanno!",
  textColor = "#FFFFFF",
  bgColor = "#16A34A",
  countdownEnabled = true,
  countdownEnd = "2025-01-01T00:00:00",
  countdownTextColor = "#FFFFFF",
  countdownBgColor = "#15803D",
  buttonText = "Dettagli",
  buttonTextColor = "#16A34A",
  buttonBgColor = "#FFFFFF",
  buttonBorderColor = "#FFFFFF",
  popupContent = DEFAULT_POPUP_CONTENT,
  whatsappNumber = "393666295174",
  contactEmail = "me@octowonders.com",
}: HelloBarProps) => {
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!countdownEnabled) return;

    const calculateTimeLeft = () => {
      const endDate = new Date(countdownEnd).getTime();
      const now = new Date().getTime();
      const difference = endDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [countdownEnabled, countdownEnd]);

  if (!enabled) return null;

  return (
    <>
      {/* This is NOT fixed - it will be inside a fixed wrapper */}
      <div
        className="w-full py-2 px-4"
        style={{ backgroundColor: bgColor }}
      >
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-2 md:gap-6">
          {/* Main Text */}
          <span
            className="text-sm md:text-base font-semibold text-center"
            style={{ color: textColor }}
          >
            {text}
          </span>

          {/* Countdown */}
          {countdownEnabled && (
            <span
              className="text-sm md:text-base font-bold"
              style={{ color: countdownTextColor }}
            >
              {timeLeft.days}gg {String(timeLeft.hours).padStart(2, "0")}h {String(timeLeft.minutes).padStart(2, "0")}m {String(timeLeft.seconds).padStart(2, "0")}s
            </span>
          )}

          {/* Details Button */}
          <button
            onClick={() => setShippingDialogOpen(true)}
            className="text-xs md:text-sm font-semibold px-3 py-1 rounded transition-opacity hover:opacity-80"
            style={{
              color: buttonTextColor,
              backgroundColor: buttonBgColor,
              border: `2px solid ${buttonBorderColor}`,
            }}
          >
            {buttonText}
          </button>
        </div>
      </div>

      {/* Shipping Details Modal */}
      <Dialog open={shippingDialogOpen} onOpenChange={setShippingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Spedizione Gratuita
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground whitespace-pre-line">
              {popupContent}
            </div>
            
            {/* Contact Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <a
                href={`https://wa.me/${whatsappNumber}?text=Ciao!%20Ho%20una%20domanda%20sulla%20spedizione...`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
              <a
                href={`mailto:${contactEmail}?subject=Domanda%20Spedizione&body=Ciao!%20Ho%20una%20domanda%20sulla%20spedizione...`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HelloBar;
