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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
      {sortedProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onBuyClick={onBuyClick}
          onCustomOrder={onCustomOrder}
          editMode={editMode}
          onProductUpdate={onProductUpdate}
        />
      ))}
    </div>
  );
};

export default MasonryGrid;