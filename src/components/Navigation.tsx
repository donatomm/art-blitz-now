import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useSiteSettings, getSettingValue } from "@/hooks/useSiteSettings";
import { staticSiteSettings } from "@/generated/staticSiteSettings";
import logo from "@/assets/logo.webp";
import HelloBar from "./HelloBar";

const CART_ENABLED = import.meta.env.VITE_ENABLE_CART === 'true';

interface NavItem {
  label: string;
  href: string;
  order?: number;
}

const defaultNavItems: NavItem[] = [
  { label: "Autore", href: "/artista", order: 0 },
  { label: "Regole di Spedizione", href: "/spedizione", order: 1 },
  { label: "Politica Prezzi", href: "/pricing-policy", order: 2 },
  { label: "Contatti", href: "/contatti", order: 3 },
];

interface NavigationProps {
  isOverHero?: boolean;
  helloBarProps?: {
    enabled?: boolean;
    text?: string;
    textColor?: string;
    bgColor?: string;
    bgOpacity?: number;
    countdownEnabled?: boolean;
    countdownEnd?: string;
    countdownTextColor?: string;
    countdownBgColor?: string;
    buttonEnabled?: boolean;
    buttonText?: string;
    buttonTextColor?: string;
    buttonBgColor?: string;
    buttonBorderColor?: string;
    popupContent?: string;
    whatsappNumber?: string;
    contactEmail?: string;
  };
}

const Navigation = ({ isOverHero = false, helloBarProps }: NavigationProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { getItemCount, setIsCartOpen } = useCart();
  const { data: settings, isLoading: settingsLoading } = useSiteSettings();

  const itemCount = getItemCount();
  const showHelloBar = helloBarProps?.enabled ?? false;

  // Get nav items from settings - use STATIC settings as defaults for SSG, then hydrate with live data
  const navItems = useMemo(() => {
    // Use static settings as SSG-safe defaults
    const staticNavItems = staticSiteSettings.nav_items;
    const fallback = staticNavItems.length > 0 ? staticNavItems : defaultNavItems;
    
    if (settingsLoading) return fallback; // Render immediately with static/fallback
    
    const items = getSettingValue<NavItem[]>(settings, "nav_items", []);
    if (items.length === 0) return fallback;
    return items.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [settings, settingsLoading]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showTransparent = isOverHero && !isScrolled;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Navigation Bar */}
      <nav
        className={`transition-all duration-300 ${
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

              {/* Cart Icon - Desktop */}
              {CART_ENABLED && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`relative ${showTransparent ? "text-white hover:bg-white/10" : ""}`}
                  onClick={() => setIsCartOpen(true)}
                >
                  <ShoppingCart className="h-5 w-5" strokeWidth={1.5} />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gold text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  )}
                </Button>
              )}
            </div>

            {/* Mobile Menu Button + Cart */}
            <div className="flex items-center gap-2 md:hidden">
              {/* Cart Icon - Mobile */}
              {CART_ENABLED && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`relative ${showTransparent ? "text-white" : ""}`}
                  onClick={() => setIsCartOpen(true)}
                >
                  <ShoppingCart className="h-5 w-5" strokeWidth={1.5} />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gold text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  )}
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className={`${showTransparent ? "text-white" : ""}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
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
      
      {/* Hello Bar - Below Navigation */}
      {showHelloBar && helloBarProps && (
        <HelloBar {...helloBarProps} />
      )}
    </header>
  );
};

export default Navigation;
