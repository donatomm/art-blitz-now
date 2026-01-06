import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import SEO from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12" style={{ backgroundColor: '#fce4ec' }}>
      <SEO 
        title="Pagina non trovata"
        description="La pagina che stai cercando non esiste."
        noindex={true}
      />
      <div className="text-center max-w-md" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <img 
          src="https://xqubydbsoucrwqhddodw.supabase.co/storage/v1/object/public/article-images//whhoops2.webp" 
          alt="Whoops" 
          className="mx-auto mb-6 w-48 h-auto"
        />
        <p className="mb-8 text-xl font-light leading-relaxed text-gray-600">
          La pagina che stai cercando sembra essersi dissolta nell'etere. Prenditi un attimo di respiro, poi lascia che ti riportiamo a casa.
        </p>
        <a 
          href="/" 
          className="inline-block px-8 py-3 bg-gray-700 text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
        >
          Take me home
        </a>
        <div className="mt-8">
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
