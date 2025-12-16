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
            <Link to="/contact" className="hover:text-white transition-colors">
              Contatti
            </Link>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/cookies" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
            <a href="/docs/termini-e-condizioni.pdf" download className="hover:text-white transition-colors">
              Termini e Condizioni di Vendita (PDF)
            </a>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-slate-700 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} OctoWonders. Tutti i diritti riservati.
        </div>
      </div>
    </footer>;
};
export default Footer;