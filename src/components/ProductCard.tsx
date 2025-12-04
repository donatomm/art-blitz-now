import { Product } from "@/data/products";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
  onBuyClick: (product: Product) => void;
  onCustomOrder: (product: Product) => void;
}

const ProductCard = ({ product, onBuyClick, onCustomOrder }: ProductCardProps) => {
  const sizePrices = product.sizes
    .map((s) => `${s.dimensions}cm €${s.price}`)
    .join(" | ");

  return (
    <div className="group overflow-hidden bg-card rounded-sm break-inside-avoid mb-1">
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="px-2 py-2 bg-card/95 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span className="font-semibold text-foreground">{product.name}</span>
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground">{product.medium}</span>
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground">{sizePrices}</span>
          <span className="text-muted-foreground">|</span>
          <Button
            size="sm"
            variant="default"
            className="h-6 px-2 text-xs"
            onClick={() => onBuyClick(product)}
          >
            BUY
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => onCustomOrder(product)}
          >
            Custom Order
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
