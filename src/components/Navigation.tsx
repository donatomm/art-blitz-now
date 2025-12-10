import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Autore", href: "/artist" },
  { label: "Regole di Spedizione", href: "/shipping" },
  { label: "Politica Prezzi", href: "/pricing-policy" },
  { label: "Contatti", href: "/contact" },
];

interface NavigationProps {
  isOverHero?: boolean;
}

const Navigation = ({ isOverHero = false }: NavigationProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showTransparent = isOverHero && !isScrolled;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showTransparent
          ? "bg-black/40 backdrop-blur-sm"
          : "bg-background/95 backdrop-blur-sm border-b"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Company Name */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="OctoWonders Logo"
              className={`w-10 h-10 ${showTransparent ? "invert" : ""}`}
            />
            <div className="flex flex-col">
              <span
                className={`text-xl font-semibold ${
                  showTransparent ? "text-white" : "text-foreground"
                }`}
              >
                OctoWonders
              </span>
              <span
                className={`text-xs font-light ${
                  showTransparent ? "text-white/70" : "text-muted-foreground"
                }`}
              >
                by Marco De Francesco
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-sm font-medium transition-colors ${
                  showTransparent
                    ? "text-white/90 hover:text-white"
                    : location.pathname === item.href
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`md:hidden ${showTransparent ? "text-white" : ""}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t bg-background">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  location.pathname === item.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;