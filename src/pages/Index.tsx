import { useState } from "react";
import { Product } from "@/types/product";
import { useProducts, useUpdateProduct } from "@/hooks/useProducts";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import MasonryGrid from "@/components/MasonryGrid";
import BuyDialog from "@/components/BuyDialog";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const { data: products = [], isLoading } = useProducts();
  const updateProduct = useUpdateProduct();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

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

  const handleProductUpdate = async (product: Product) => {
    try {
      await updateProduct.mutateAsync(product);
      toast({
        title: "Product updated",
        description: "Changes saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes. Make sure you're logged in as admin.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation isOverHero />

      <Hero
        imageUrl={heroImage}
        title={"ACCENDI QUELLA STANZA\nFALLA VIBRARE"}
        subtitle="Regalo di Natale Fatto. Ansia Zero. Risultato Memorabile."
      />

      <main className="p-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : (
          <MasonryGrid
            products={products}
            onBuyClick={handleBuyClick}
            onCustomOrder={handleCustomOrder}
            editMode={editMode}
            onProductUpdate={handleProductUpdate}
          />
        )}
      </main>

      <BuyDialog
        product={selectedProduct}
        open={isBuyDialogOpen}
        onOpenChange={setIsBuyDialogOpen}
      />

      {/* Admin Edit Toggle */}
      <Button
        variant={editMode ? "default" : "outline"}
        size="icon"
        className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
        onClick={() => setEditMode(!editMode)}
      >
        <Settings className={`h-5 w-5 ${editMode ? "animate-spin" : ""}`} />
      </Button>
    </div>
  );
};

export default Index;