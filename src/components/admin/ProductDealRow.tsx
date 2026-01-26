import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ProductSize } from "@/types/product";

interface ProductDealRowProps {
  size: ProductSize;
  index: number;
  onUpdate: (index: number, field: keyof ProductSize, value: string | number | boolean) => void;
}

/**
 * ProductDealRow - Isolated component for deal/offer editing per size.
 * Uses local state with debouncing to prevent parent re-renders on every keystroke.
 */
const ProductDealRow = ({ size, index, onUpdate }: ProductDealRowProps) => {
  // Local state for immediate UI feedback
  const [localDealPrice, setLocalDealPrice] = useState(String(size.deal_price || ""));
  const [localDealText, setLocalDealText] = useState(size.deal_label_text || "");
  
  const priceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local state when external size changes
  useEffect(() => {
    setLocalDealPrice(String(size.deal_price || ""));
    setLocalDealText(size.deal_label_text || "");
  }, [size.deal_price, size.deal_label_text]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (priceTimeoutRef.current) clearTimeout(priceTimeoutRef.current);
      if (textTimeoutRef.current) clearTimeout(textTimeoutRef.current);
    };
  }, []);

  const handleDealPriceChange = useCallback((value: string) => {
    setLocalDealPrice(value);
    if (priceTimeoutRef.current) clearTimeout(priceTimeoutRef.current);
    priceTimeoutRef.current = setTimeout(() => {
      onUpdate(index, "deal_price", Number(value) || 0);
    }, 150);
  }, [index, onUpdate]);

  const handleDealTextChange = useCallback((value: string) => {
    setLocalDealText(value);
    if (textTimeoutRef.current) clearTimeout(textTimeoutRef.current);
    textTimeoutRef.current = setTimeout(() => {
      onUpdate(index, "deal_label_text", value);
    }, 150);
  }, [index, onUpdate]);

  return (
    <div className="p-2 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium w-20">{size.dimensions || "—"}</span>
        <Switch
          checked={size.deal_label_enabled || false}
          onCheckedChange={(checked) => onUpdate(index, "deal_label_enabled", checked)}
        />
        <span className="text-xs text-muted-foreground">Offerta</span>
        {size.deal_label_enabled && (
          <>
            <Input
              placeholder="Prezzo Offerta €"
              type="number"
              value={localDealPrice}
              onChange={(e) => handleDealPriceChange(e.target.value)}
              className="w-24 text-xs"
            />
            <Input
              value={localDealText}
              onChange={(e) => handleDealTextChange(e.target.value)}
              className="flex-1 text-xs"
              placeholder="es. scade il 31 Dic."
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ProductDealRow;
