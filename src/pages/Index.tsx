import { useState, useRef } from "react";
import { Product } from "@/types/product";
import { useProducts, useUpdateProduct, useCreateProduct, useDeleteProduct } from "@/hooks/useProducts";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import MasonryGrid from "@/components/MasonryGrid";
import BuyDialog from "@/components/BuyDialog";
import AdminPanel from "@/components/AdminPanel";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { toast } from "@/hooks/use-toast";
import { useSiteSettings, getSettingValue } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
const Index = () => {
  const {
    data: products = [],
    isLoading,
    refetch
  } = useProducts();
  const { data: siteSettings } = useSiteSettings();
  const updateProduct = useUpdateProduct();
  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  
  // Get hero content from site settings
  const heroTitle = getSettingValue<string>(siteSettings, "hero_title", "Opere magnetiche. Uniche. Non per tutti.");
  const heroSubtitle = getSettingValue<string>(siteSettings, "hero_subtitle", "Trasforma la tua parete in un'esperienza visiva che cattura lo sguardo e non lo lascia andare.");
  const heroCtaText = getSettingValue<string>(siteSettings, "hero_cta_text", "ESPLORA LA COLLEZIONE");
  const heroImageUrl = getSettingValue<string>(siteSettings, "hero_image", "");
  const trustBarItems = getSettingValue<string[]>(siteSettings, "trust_bar_items", []);
  
  // Get HelloBar settings
  const hellobarEnabled = getSettingValue<boolean>(siteSettings, "hellobar_enabled", true);
  const hellobarText = getSettingValue<string>(siteSettings, "hellobar_text", "SPEDIZIONE GRATUITA in Italia - 30% fino a capodanno!");
  const hellobarTextColor = getSettingValue<string>(siteSettings, "hellobar_text_color", "#FFFFFF");
  const hellobarBgColor = getSettingValue<string>(siteSettings, "hellobar_bg_color", "#16A34A");
  const hellobarBgOpacity = getSettingValue<number>(siteSettings, "hellobar_bg_opacity", 100);
  const hellobarCountdownEnabled = getSettingValue<boolean>(siteSettings, "hellobar_countdown_enabled", true);
  const hellobarCountdownEnd = getSettingValue<string>(siteSettings, "hellobar_countdown_end", "2025-01-01T00:00:00");
  const hellobarCountdownTextColor = getSettingValue<string>(siteSettings, "hellobar_countdown_text_color", "#FFFFFF");
  const hellobarCountdownBgColor = getSettingValue<string>(siteSettings, "hellobar_countdown_bg_color", "#15803D");
  const hellobarButtonText = getSettingValue<string>(siteSettings, "hellobar_button_text", "Dettagli");
  const hellobarButtonTextColor = getSettingValue<string>(siteSettings, "hellobar_button_text_color", "#16A34A");
  const hellobarButtonBgColor = getSettingValue<string>(siteSettings, "hellobar_button_bg_color", "#FFFFFF");
  const hellobarButtonBorderColor = getSettingValue<string>(siteSettings, "hellobar_button_border_color", "#FFFFFF");
  const hellobarPopupContent = getSettingValue<string>(siteSettings, "hellobar_popup_content", "");
  const hellobarWhatsappNumber = getSettingValue<string>(siteSettings, "hellobar_whatsapp_number", "393666295174");
  const hellobarContactEmail = getSettingValue<string>(siteSettings, "hellobar_contact_email", "me@octowonders.com");
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
  const handleProductsChange = async (updatedProducts: Product[]) => {
    try {
      console.log('[Index] handleProductsChange called with', updatedProducts.length, 'products');
      
      const existingIds = new Set(products.map(p => p.id));
      const updatedIds = new Set(updatedProducts.map(p => p.id));

      // Find new products (in updated but not in existing)
      const newProducts = updatedProducts.filter(p => !existingIds.has(p.id));

      // Find deleted products (in existing but not in updated)
      const deletedProducts = products.filter(p => !updatedIds.has(p.id));

      // Find products to update (exist in both) - only those with actual changes
      const productsToUpdate = updatedProducts.filter(p => {
        if (!existingIds.has(p.id)) return false;
        const original = products.find(op => op.id === p.id);
        // Check if display_order or other key fields changed
        return original?.display_order !== p.display_order || 
               original?.is_active !== p.is_active ||
               JSON.stringify(original) !== JSON.stringify(p);
      });

      console.log('[Index] Products to update:', productsToUpdate.map(p => ({ name: p.name, order: p.display_order })));

      // Create new products
      for (const product of newProducts) {
        await createProduct.mutateAsync(product);
      }

      // Update existing products
      for (const product of productsToUpdate) {
        console.log('[Index] Updating product:', product.name, 'with display_order:', product.display_order);
        await updateProduct.mutateAsync(product);
      }

      // Delete removed products
      for (const product of deletedProducts) {
        await deleteProduct.mutateAsync(product.id);
      }
      
      console.log('[Index] All updates complete, refetching...');
      await refetch();
      
      // Regenerate sitemap automatically after product changes
      try {
        const { error: sitemapError } = await supabase.functions.invoke('regenerate-sitemap');
        if (sitemapError) {
          console.warn('[Index] Sitemap regeneration failed:', sitemapError);
        } else {
          console.log('[Index] Sitemap regenerated successfully');
        }
      } catch (sitemapError) {
        console.warn('[Index] Sitemap regeneration failed:', sitemapError);
        // Don't show error to user - sitemap is not critical
      }

      toast({
        title: "Prodotti aggiornati",
        description: "Modifiche salvate con successo."
      });
    } catch (error) {
      console.error('[Index] Error saving products:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare. Verifica di essere admin.",
        variant: "destructive"
      });
    }
  };
  return <div className="min-h-screen bg-background">
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
        {isLoading ? <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading products...</p>
          </div> : <MasonryGrid products={products.filter(p => p.is_active)} onBuyClick={handleBuyClick} onCustomOrder={handleCustomOrder} />}
      </main>

      <BuyDialog product={selectedProduct} open={isBuyDialogOpen} onOpenChange={setIsBuyDialogOpen} />

      <AdminPanel products={products} onProductsChange={handleProductsChange} />
      
      <Footer />
    </div>;
};
export default Index;