import Masonry from "react-masonry-css";
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";

interface MasonryGridProps {
  products: Product[];
  onBuyClick: (product: Product) => void;
  editMode?: boolean;
  onProductUpdate?: (product: Product) => void;
}

const MasonryGrid = ({
  products,
  onBuyClick,
  editMode = false,
  onProductUpdate,
}: MasonryGridProps) => {
  const sortedProducts = [...products].sort((a, b) => a.display_order - b.display_order);

  // Responsive breakpoints for column count
  const breakpointColumns = {
    default: 4,
    1280: 4,  // xl
    1024: 3,  // lg
    640: 2,   // sm
    0: 1      // mobile
  };

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="flex -ml-1 w-auto"
      columnClassName="pl-1 bg-clip-padding"
    >
      {sortedProducts.map((product) => (
        <div key={product.id} className="mb-1">
          <ProductCard
            product={product}
            onBuyClick={onBuyClick}
            editMode={editMode}
            onProductUpdate={onProductUpdate}
          />
        </div>
      ))}
    </Masonry>
  );
};

export default MasonryGrid;
