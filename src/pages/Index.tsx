import { useState } from "react";
import { products as initialProducts, Product } from "@/data/products";
import MasonryGrid from "@/components/MasonryGrid";
import BuyDialog from "@/components/BuyDialog";
import AdminPanel from "@/components/AdminPanel";

const Index = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold tracking-tight">Wall Art Gallery</h1>
        </div>
      </header>

      <main className="p-1">
        <MasonryGrid
          products={products}
          onBuyClick={handleBuyClick}
          onCustomOrder={handleCustomOrder}
        />
      </main>

      <BuyDialog
        product={selectedProduct}
        open={isBuyDialogOpen}
        onOpenChange={setIsBuyDialogOpen}
      />

      <AdminPanel products={products} onProductsChange={setProducts} />
    </div>
  );
};

export default Index;
