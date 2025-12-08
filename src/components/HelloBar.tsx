import { useState, useEffect } from 'react';

const HelloBar = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`fixed top-16 left-0 right-0 z-40 h-[45px] w-full bg-emerald-600 flex items-center justify-center transition-all duration-300 ${
        isVisible 
          ? 'opacity-100 translate-y-0 animate-[vibrate_0.3s_ease-in-out]' 
          : 'opacity-0 -translate-y-full'
      }`}
    >
      {/* Contenuto da aggiungere */}
    </div>
  );
};

export default HelloBar;
