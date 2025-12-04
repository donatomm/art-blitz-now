import { Product } from "@/data/products";
import ProductCard from "./ProductCard";

interface MasonryGridProps {
  products: Product[];
  onBuyClick: (product: Product) => void;
  onCustomOrder: (product: Product) => void;
}

const MasonryGrid = ({ products, onBuyClick, onCustomOrder }: MasonryGridProps) => {
  const sortedProducts = [...products].sort((a, b) => a.order - b.order);

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-1">
      {sortedProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onBuyClick={onBuyClick}
          onCustomOrder={onCustomOrder}
        />
      ))}
    </div>
  );
};

export default MasonryGrid;
