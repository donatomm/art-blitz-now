import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import SEO from "@/components/SEO";
import elenaImage from "@/assets/404-elena.webp";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8" style={{ backgroundColor: '#fce4ec' }}>
      <SEO 
        title="Pagina non trovata"
        description="La pagina che stai cercando non esiste."
        noindex={true}
      />
      <div className="text-center max-w-md">
        <img 
          src={elenaImage} 
          alt="Elena illustration" 
          className="mx-auto w-32 h-32 rounded-full mb-4"
        />
        
        <p className="mb-3 text-lg font-light leading-relaxed text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          La pagina che stai cercando sembra essersi dissolta nell'etere.
        </p>
        
        <div className="mb-3">
          <span className="text-gray-600 font-light" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Prova questo:{" "}
          </span>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gray-700 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            <RefreshCw size={14} />
            Aggiorna Pagina
          </button>
        </div>
        
        <p className="mb-4 text-lg font-light leading-relaxed text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Oppure prenditi un attimo di respiro, poi lascia che ti riportiamo a casa.
        </p>
        
        <a 
          href="/" 
          className="inline-block px-8 py-3 bg-gray-700 text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
        >
          Take me home
        </a>
        
        <div className="mt-6">
          <img 
            src="https://xqubydbsoucrwqhddodw.supabase.co/storage/v1/object/public/article-images//home404.webp" 
            alt="404 illustration" 
            className="mx-auto max-w-full h-auto rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
