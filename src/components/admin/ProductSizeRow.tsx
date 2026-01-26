import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { ProductSize } from "@/types/product";

interface ProductSizeRowProps {
  size: ProductSize;
  index: number;
  onUpdate: (index: number, field: keyof ProductSize, value: string | number | boolean) => void;
  onRemove: (index: number) => void;
}

/**
 * ProductSizeRow - Isolated component for product size editing.
 * Uses local state with debouncing to prevent parent re-renders on every keystroke.
 */
const ProductSizeRow = ({ size, index, onUpdate, onRemove }: ProductSizeRowProps) => {
  // Local state for immediate UI feedback
  const [localDimensions, setLocalDimensions] = useState(size.dimensions);
  const [localPrice, setLocalPrice] = useState(String(size.price || ""));
  const [localStripeId, setLocalStripeId] = useState(size.stripe_product_id || "");
  
  const dimensionsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const priceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stripeIdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local state when external size changes (e.g., on dialog open)
  useEffect(() => {
    setLocalDimensions(size.dimensions);
    setLocalPrice(String(size.price || ""));
    setLocalStripeId(size.stripe_product_id || "");
  }, [size.dimensions, size.price, size.stripe_product_id]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (dimensionsTimeoutRef.current) clearTimeout(dimensionsTimeoutRef.current);
      if (priceTimeoutRef.current) clearTimeout(priceTimeoutRef.current);
      if (stripeIdTimeoutRef.current) clearTimeout(stripeIdTimeoutRef.current);
    };
  }, []);

  const handleDimensionsChange = useCallback((value: string) => {
    setLocalDimensions(value);
    if (dimensionsTimeoutRef.current) clearTimeout(dimensionsTimeoutRef.current);
    dimensionsTimeoutRef.current = setTimeout(() => {
      onUpdate(index, "dimensions", value);
    }, 150);
  }, [index, onUpdate]);

  const handlePriceChange = useCallback((value: string) => {
    setLocalPrice(value);
    if (priceTimeoutRef.current) clearTimeout(priceTimeoutRef.current);
    priceTimeoutRef.current = setTimeout(() => {
      onUpdate(index, "price", Number(value) || 0);
    }, 150);
  }, [index, onUpdate]);

  const handleStripeIdChange = useCallback((value: string) => {
    setLocalStripeId(value);
    if (stripeIdTimeoutRef.current) clearTimeout(stripeIdTimeoutRef.current);
    stripeIdTimeoutRef.current = setTimeout(() => {
      onUpdate(index, "stripe_product_id", value);
    }, 150);
  }, [index, onUpdate]);

  return (
    <div className="grid grid-cols-[1fr_80px_1fr_40px] gap-2 items-center">
      <Input
        placeholder="NNxNN"
        value={localDimensions}
        onChange={(e) => handleDimensionsChange(e.target.value)}
      />
      <Input
        placeholder="0"
        type="number"
        value={localPrice}
        onChange={(e) => handlePriceChange(e.target.value)}
      />
      <Input
        placeholder="prod_ABC123"
        value={localStripeId}
        onChange={(e) => handleStripeIdChange(e.target.value)}
        className="text-xs font-mono"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onRemove(index)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ProductSizeRow;
