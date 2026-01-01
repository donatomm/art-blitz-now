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

  // Use flexbox with wrapping for correct order and good visual appearance
  return (
    <div className="flex flex-wrap gap-1">
      {sortedProducts.map((product) => (
        <div 
          key={product.id} 
          className="w-full sm:w-[calc(50%-2px)] lg:w-[calc(33.333%-3px)] xl:w-[calc(25%-3px)]"
        >
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