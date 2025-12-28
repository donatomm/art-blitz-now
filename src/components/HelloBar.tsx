import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
      <div
        className="fixed top-0 left-0 right-0 z-50 py-2 px-4"
        style={{ backgroundColor: bgColor }}
      >
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-3 md:gap-6">
          {/* Main Text */}
          <span
            className="text-sm md:text-base font-semibold text-center"
            style={{ color: textColor }}
          >
            {text}
          </span>

          {/* Countdown */}
          {countdownEnabled && (
            <div className="flex items-center gap-1">
              {[
                { value: timeLeft.days, label: "G" },
                { value: timeLeft.hours, label: "H" },
                { value: timeLeft.minutes, label: "M" },
                { value: timeLeft.seconds, label: "S" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center px-2 py-1 rounded text-xs md:text-sm font-bold"
                  style={{
                    backgroundColor: countdownBgColor,
                    color: countdownTextColor,
                  }}
                >
                  <span className="min-w-[20px] text-center">{String(item.value).padStart(2, "0")}</span>
                  <span className="text-[10px] md:text-xs ml-0.5 opacity-80">{item.label}</span>
                </div>
              ))}
            </div>
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
              Informazioni Spedizione
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-base mb-1">
                🚚 Spedizione Gratuita
              </h3>
              <p className="text-muted-foreground">
                Spedizione gratuita su tutti gli ordini in Italia. Consegna in
                3-5 giorni lavorativi.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">
                🎁 Offerta Speciale
              </h3>
              <p className="text-muted-foreground">
                30% di sconto su tutti i prodotti fino a Capodanno! Approfitta
                subito di questa offerta esclusiva.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">
                📦 Imballaggio Premium
              </h3>
              <p className="text-muted-foreground">
                Ogni opera viene accuratamente imballata per garantire una
                consegna perfetta.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HelloBar;
