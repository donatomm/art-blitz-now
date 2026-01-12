import { useState, useRef, lazy, Suspense } from "react";
import { Product } from "@/types/product";
import { useStaticProducts } from "@/hooks/useStaticProducts";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import MasonryGrid from "@/components/MasonryGrid";
import BuyDialog from "@/components/BuyDialog";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { useStaticSiteSettings } from "@/hooks/useStaticSiteSettings";

// Lazy load AdminPanel - it's 1278 lines + xlsx library, only needed by admins
const AdminPanel = lazy(() => import("@/components/AdminPanel"));

const Index = () => {
  // Use STATIC products for instant LCP - no API call blocking render
  const { products } = useStaticProducts();
  
  // Use STATIC settings for everything - NO API CALLS blocking LCP
  const staticSettings = useStaticSiteSettings();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  
  // Get hero content from STATIC settings (SSG-safe, no API waterfall)
  const heroTitle = staticSettings.hero_title;
  const heroSubtitle = staticSettings.hero_subtitle;
  const heroCtaText = staticSettings.hero_cta_text;
  const heroImageUrl = staticSettings.hero_image;
  const trustBarItems = staticSettings.trust_bar_items;
  
  // Get HelloBar settings from STATIC settings (no API call!)
  const hellobarEnabled = staticSettings.hellobar_enabled;
  const hellobarText = staticSettings.hellobar_text;
  const hellobarTextColor = staticSettings.hellobar_text_color;
  const hellobarBgColor = staticSettings.hellobar_bg_color;
  const hellobarBgOpacity = staticSettings.hellobar_bg_opacity;
  const hellobarCountdownEnabled = staticSettings.hellobar_countdown_enabled;
  const hellobarCountdownEnd = staticSettings.hellobar_countdown_end;
  const hellobarCountdownTextColor = staticSettings.hellobar_countdown_text_color;
  const hellobarCountdownBgColor = staticSettings.hellobar_countdown_bg_color;
  const hellobarButtonEnabled = staticSettings.hellobar_button_enabled;
  const hellobarButtonText = staticSettings.hellobar_button_text;
  const hellobarButtonTextColor = staticSettings.hellobar_button_text_color;
  const hellobarButtonBgColor = staticSettings.hellobar_button_bg_color;
  const hellobarButtonBorderColor = staticSettings.hellobar_button_border_color;
  const hellobarPopupContent = staticSettings.hellobar_popup_content;
  const hellobarWhatsappNumber = staticSettings.hellobar_whatsapp_number;
  const hellobarContactEmail = staticSettings.hellobar_contact_email;

  const scrollToGallery = () => {
    galleryRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };
  
  const handleBuyClick = (product: Product) => {
    setSelectedProduct(product);
    setIsBuyDialogOpen(true);
  };
  
  const handleCustomOrder = (product: Product) => {
    const message = encodeURIComponent(`Hi! I'm interested in a custom order for:\n\n${product.name}\n${product.medium}\n\nPlease let me know the available options!`);
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO />
      <Navigation 
        isOverHero 
        helloBarProps={{
          enabled: hellobarEnabled,
          text: hellobarText,
          textColor: hellobarTextColor,
          bgColor: hellobarBgColor,
          bgOpacity: hellobarBgOpacity,
          countdownEnabled: hellobarCountdownEnabled,
          countdownEnd: hellobarCountdownEnd,
          countdownTextColor: hellobarCountdownTextColor,
          countdownBgColor: hellobarCountdownBgColor,
          buttonEnabled: hellobarButtonEnabled,
          buttonText: hellobarButtonText,
          buttonTextColor: hellobarButtonTextColor,
          buttonBgColor: hellobarButtonBgColor,
          buttonBorderColor: hellobarButtonBorderColor,
          popupContent: hellobarPopupContent,
          whatsappNumber: hellobarWhatsappNumber,
          contactEmail: hellobarContactEmail,
        }}
      />

      <Hero 
        imageUrl={heroImageUrl}
        title={heroTitle} 
        subtitle={heroSubtitle} 
        ctaText={heroCtaText} 
        onCtaClick={scrollToGallery}
        trustBarItems={trustBarItems}
      />

      <main ref={galleryRef} className="p-1">
        <MasonryGrid 
          products={products.filter(p => p.is_active)} 
          onBuyClick={handleBuyClick} 
          onCustomOrder={handleCustomOrder} 
        />
      </main>

      <BuyDialog product={selectedProduct} open={isBuyDialogOpen} onOpenChange={setIsBuyDialogOpen} />

      <Suspense fallback={null}>
        <AdminPanel />
      </Suspense>
      
      <Footer />
    </div>
  );
};

export default Index;