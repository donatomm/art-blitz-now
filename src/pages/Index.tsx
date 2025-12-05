import { useRef } from "react";
import { Product } from "@/types/product";
import { useProducts, useUpdateProduct } from "@/hooks/useProducts";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import MasonryGrid from "@/components/MasonryGrid";
import BuyDialog from "@/components/BuyDialog";
import AdminPanel from "@/components/AdminPanel";
import { toast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-image.jpg";
import { useState } from "react";

const Index = () => {
  const { data: products = [], isLoading, refetch } = useProducts();
  const updateProduct = useUpdateProduct();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  const scrollToGallery = () => {
    galleryRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBuyClick = (product: Product) => {
    setSelectedProduct(product);
    setIsBuyDialogOpen(true);
  };

  const handleCustomOrder = (product: Product) => {
    const message = encodeURIComponent(
      `Hi! I'm interested in a custom order for:\n\n${product.name}\n${product.medium}\n\nPlease let me know the available options!`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handleProductsChange = async (updatedProducts: Product[]) => {
    try {
      for (const product of updatedProducts) {
        await updateProduct.mutateAsync(product);
      }
      refetch();
      toast({
        title: "Prodotti aggiornati",
        description: "Modifiche salvate con successo.",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile salvare. Verifica di essere admin.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation isOverHero />

      <Hero
        imageUrl={heroImage}
        title={"Accendi Quella Stanza\nFalla Vibrare"}
        subtitle="Regalo di Natale Fatto. Ansia Zero. Risultato Memorabile."
        ctaText="Trova il Regalo Perfetto"
        onCtaClick={scrollToGallery}
      />

      <main ref={galleryRef} className="p-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : (
          <MasonryGrid
            products={products}
            onBuyClick={handleBuyClick}
            onCustomOrder={handleCustomOrder}
          />
        )}
      </main>

      <BuyDialog
        product={selectedProduct}
        open={isBuyDialogOpen}
        onOpenChange={setIsBuyDialogOpen}
      />

      {/* Admin Panel */}
      <AdminPanel products={products} onProductsChange={handleProductsChange} />
    </div>
  );
};

export default Index;