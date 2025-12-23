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
const Index = () => {
  const {
    data: products = [],
    isLoading,
    refetch
  } = useProducts();
  const updateProduct = useUpdateProduct();
  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
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
      const existingIds = new Set(products.map(p => p.id));
      const updatedIds = new Set(updatedProducts.map(p => p.id));

      // Find new products (in updated but not in existing)
      const newProducts = updatedProducts.filter(p => !existingIds.has(p.id));

      // Find deleted products (in existing but not in updated)
      const deletedProducts = products.filter(p => !updatedIds.has(p.id));

      // Find products to update (exist in both)
      const productsToUpdate = updatedProducts.filter(p => existingIds.has(p.id));

      // Create new products
      for (const product of newProducts) {
        await createProduct.mutateAsync(product);
      }

      // Update existing products
      for (const product of productsToUpdate) {
        await updateProduct.mutateAsync(product);
      }

      // Delete removed products
      for (const product of deletedProducts) {
        await deleteProduct.mutateAsync(product.id);
      }
      refetch();
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
      <Navigation isOverHero />
      

      <Hero title="Opere magnetiche. Uniche. Non per tutti." subtitle="Trasforma la tua parete in un'esperienza visiva che cattura lo sguardo e non lo lascia andare." ctaText="ESPLORA LA COLLEZIONE" onCtaClick={scrollToGallery} />

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