import { useState } from "react";
import { Link } from "react-router-dom";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onBuyClick: (product: Product) => void;
  onCustomOrder: (product: Product) => void;
  editMode?: boolean;
  onProductUpdate?: (product: Product) => void;
}

const ProductCard = ({
  product,
  onBuyClick,
  onCustomOrder,
  editMode = false,
  onProductUpdate
}: ProductCardProps) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const sizePrices = product.sizes
    .filter((s) => s.price > 0)
    .map((s) => `${s.dimensions} €${s.price}`)
    .join(" | ");

  const handleEditStart = (field: string, value: string) => {
    if (!editMode) return;
    setEditingField(field);
    setEditValue(value);
  };

  const handleEditSave = () => {
    if (!onProductUpdate || !editingField) return;
    const updatedProduct = {
      ...product
    };
    if (editingField === "name") {
      updatedProduct.name = editValue;
    } else if (editingField === "medium") {
      updatedProduct.medium = editValue;
    }
    onProductUpdate(updatedProduct);
    setEditingField(null);
    setEditValue("");
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setEditValue("");
  };

  const renderEditableField = (field: string, value: string, className: string) => {
    if (editMode && editingField === field) {
      return <div className="flex items-center gap-1">
          <Input value={editValue} onChange={e => setEditValue(e.target.value)} className="h-6 text-xs py-0 px-1" autoFocus />
          <Button size="icon" variant="ghost" className="h-5 w-5" onClick={handleEditSave}>
            <Check className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-5 w-5" onClick={handleEditCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>;
    }
    return <span className={`${className} ${editMode ? "cursor-pointer hover:bg-accent rounded px-1" : ""}`} onClick={() => handleEditStart(field, value)}>
        {value}
      </span>;
  };

  const isComingSoon = product.name.toLowerCase().includes("coming soon") || product.name.toLowerCase().includes("in arrivo");

  const imageContent = (
    <>
      <img src={product.image_url} alt={product.name} width={600} height={600} className={`w-full h-auto object-cover transition-transform duration-500 ${!isComingSoon ? "group-hover:scale-105" : ""}`} loading="lazy" />
      {/* Deal Label Badge - show if ANY size has deal enabled with deal_price > 0 */}
      {(() => {
        const dealSize = product.sizes.find(s => s.deal_label_enabled && s.deal_price && s.deal_price > 0);
        if (!dealSize) return null;
        return (
          <div className="absolute top-2 left-2 z-10">
            <span className="inline-block bg-yellow-500 text-black font-bold text-xs px-2 py-1 rounded shadow-lg border-2 border-black">
              OFFERTA
            </span>
          </div>
        );
      })()}
      {editMode && <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">
            Click to edit image
          </span>
        </div>}
    </>
  );

  return <div className="group overflow-hidden bg-card rounded-sm break-inside-avoid mb-1">
      {isComingSoon ? (
        <div className="relative overflow-hidden block cursor-default">
          {imageContent}
        </div>
      ) : (
        <Link to={`/product/${product.slug || product.id}`} className="relative overflow-hidden block">
          {imageContent}
        </Link>
      )}
      <div className="px-2 py-2 bg-card/95 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {renderEditableField("name", product.name, "font-semibold text-foreground")}
          <span className="text-muted-foreground">|</span>
          {renderEditableField("medium", product.medium, "text-muted-foreground")}
          {!isComingSoon && (
            <>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground mx-px">{sizePrices}</span>
              <span className="text-muted-foreground">|</span>
              <Link to={`/product/${product.slug || product.id}#acquista`}>
                <Button 
                  size="sm" 
                  className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700 text-white font-bold"
                >
                  ACQUISTA
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>;
};

export default ProductCard;