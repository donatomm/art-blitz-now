import { Link } from "react-router-dom";
import { Product } from "@/types/product";

interface RelatedProductsProps {
  currentProduct: Product;
  allProducts: Product[];
  maxItems?: number;
}

const RelatedProducts = ({ 
  currentProduct, 
  allProducts, 
  maxItems = 4 
}: RelatedProductsProps) => {
  // Helper to check if products share any tags
  const hasMatchingTags = (a: Product, b: Product) => {
    if (!a.tags?.length || !b.tags?.length) return false;
    return a.tags.some(tag => b.tags?.includes(tag));
  };

  // Filter related products by matching tags
  const relatedProducts = allProducts
    .filter(p => 
      p.id !== currentProduct.id && 
      p.is_active &&
      hasMatchingTags(p, currentProduct) &&
      !p.name.toLowerCase().includes("coming soon") &&
      !p.name.toLowerCase().includes("in arrivo")
    )
    .slice(0, maxItems);

  // If no products with same medium, show other active products
  const displayProducts = relatedProducts.length > 0 
    ? relatedProducts 
    : allProducts
        .filter(p => 
          p.id !== currentProduct.id && 
          p.is_active &&
          !p.name.toLowerCase().includes("coming soon") &&
          !p.name.toLowerCase().includes("in arrivo")
        )
        .slice(0, maxItems);

  if (displayProducts.length === 0) return null;

  // Get min price for each product
  const getMinPrice = (product: Product) => {
    const activePrices = product.sizes
      .filter(s => s.price > 0)
      .map(s => s.deal_label_enabled && s.deal_price && s.deal_price > 0 ? s.deal_price : s.price);
    return activePrices.length > 0 ? Math.min(...activePrices) : 0;
  };

  return (
    <section className="mt-16 border-t border-border pt-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        {relatedProducts.length > 0 ? "Opere Simili" : "Altre Opere"}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {displayProducts.map((product) => {
          const minPrice = getMinPrice(product);
          return (
            <Link
              key={product.id}
              to={`/product/${product.slug || product.id}`}
              className="group overflow-hidden rounded-lg bg-card border border-border hover:border-gold transition-colors"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={product.image_url}
                  alt={`${product.name} - ${product.medium} - Stampa su tela OctoWonders`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {product.is_new && (
                  <span className="absolute top-2 right-2 bg-yellow-300 text-black font-bold text-xs px-2 py-1 rounded">
                    NEW
                  </span>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-foreground text-sm truncate">
                  {product.name}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {product.medium}
                </p>
                {minPrice > 0 && (
                  <p className="text-sm font-bold text-gold mt-1">
                    Da €{minPrice}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedProducts;
