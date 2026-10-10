import Masonry from "react-masonry-css";
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";

interface MasonryGridProps {
  products: Product[];
  onBuyClick: (product: Product) => void;
  editMode?: boolean;
  onProductUpdate?: (product: Product) => void;
  /** "masonry" = Mosaico (default), "grid" = Dritte (straight rows, exact order) */
  layout?: "masonry" | "grid";
}

const MasonryGrid = ({
  products,
  onBuyClick,
  editMode = false,
  onProductUpdate,
  layout = "masonry",
}: MasonryGridProps) => {
  const sortedProducts = [...products].sort((a, b) => a.display_order - b.display_order);

  if (layout === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 items-start">
        {sortedProducts.map((product) => (
          <div key={product.id}>
            <ProductCard
              product={product}
              onBuyClick={onBuyClick}
              editMode={editMode}
              onProductUpdate={onProductUpdate}
            />
          </div>
        ))}
      </div>
    );
  }

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
