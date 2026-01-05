import { Link } from "react-router-dom";
const Footer = () => {
  return <footer className="bg-slate-900 text-slate-300 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="font-semibold text-white">OctoWonders</p>
            <p className="text-sm text-slate-400">by Marco De Francesco</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/artist" className="hover:text-white transition-colors">
              Autore
            </Link>
            <Link to="/shipping" className="hover:text-white transition-colors">
              Spedizioni
            </Link>
            <Link to="/resi-rimborsi" className="hover:text-white transition-colors">
              Resi e Rimborsi
            </Link>
            <Link to="/contact" className="hover:text-white transition-colors">
              Contatti
            </Link>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/cookies" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Termini e Condizioni di Vendita
            </Link>
            <Link to="/sitemap" className="hover:text-white transition-colors">
              Mappa del Sito
            </Link>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-slate-700 text-center text-sm text-slate-500">
          <p>Codice Fiscale MNGDTM66L18F205N</p>
          <p className="mt-1">© {new Date().getFullYear()} OctoWonders by Marco De Francesco alias Donato Marco Mangialardo. Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>;
};
export default Footer;