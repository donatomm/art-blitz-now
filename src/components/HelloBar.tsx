import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
const HelloBar = () => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  return <div className={`fixed top-16 left-0 right-0 z-40 h-[45px] w-full bg-emerald-600 flex items-center justify-center transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0 animate-vibrate' : 'opacity-0 -translate-y-full'}`}>
      <p className="text-sm font-medium flex items-center gap-2 text-input">SPEDIZIONE GRATUITA (?) icon   Consegna garantita entro (xmas emoji) Natale se acquistata ENTRO il 13/14 Dicembre (?)icon <span className="font-bold">SPEDIZIONE GRATUITA</span> ​         <Clock className="inline w-4 h-4" />
      </p>
    </div>;
};
export default HelloBar;