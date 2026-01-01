import { Product } from "@/types/product";
import ProductCard from "./ProductCard";

interface MasonryGridProps {
  products: Product[];
  onBuyClick: (product: Product) => void;
  onCustomOrder: (product: Product) => void;
  editMode?: boolean;
  onProductUpdate?: (product: Product) => void;
}

const MasonryGrid = ({
  products,
  onBuyClick,
  onCustomOrder,
  editMode = false,
  onProductUpdate,
}: MasonryGridProps) => {
  const sortedProducts = [...products].sort((a, b) => a.display_order - b.display_order);

  // CSS columns for masonry layout - products flow top-to-bottom per column
  // This is the intended visual behavior for a gallery
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-1">
      {sortedProducts.map((product) => (
        <div key={product.id} className="break-inside-avoid mb-1">
          <ProductCard
            product={product}
            onBuyClick={onBuyClick}
            onCustomOrder={onCustomOrder}
            editMode={editMode}
            onProductUpdate={onProductUpdate}
          />
        </div>
      ))}
    </div>
  );
};

export default MasonryGrid;