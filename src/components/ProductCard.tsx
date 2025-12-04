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
  onProductUpdate,
}: ProductCardProps) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const sizePrices = product.sizes
    .map((s) => `${s.dimensions}cm €${s.price}`)
    .join(" | ");

  const handleEditStart = (field: string, value: string) => {
    if (!editMode) return;
    setEditingField(field);
    setEditValue(value);
  };

  const handleEditSave = () => {
    if (!onProductUpdate || !editingField) return;

    const updatedProduct = { ...product };
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
      return (
        <div className="flex items-center gap-1">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-6 text-xs py-0 px-1"
            autoFocus
          />
          <Button size="icon" variant="ghost" className="h-5 w-5" onClick={handleEditSave}>
            <Check className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-5 w-5" onClick={handleEditCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    return (
      <span
        className={`${className} ${editMode ? "cursor-pointer hover:bg-accent rounded px-1" : ""}`}
        onClick={() => handleEditStart(field, value)}
      >
        {value}
      </span>
    );
  };

  return (
    <div className="group overflow-hidden bg-card rounded-sm break-inside-avoid mb-1">
      <Link to={`/product/${product.id}`} className="relative overflow-hidden block">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {editMode && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">
              Click to edit image
            </span>
          </div>
        )}
      </Link>
      <div className="px-2 py-2 bg-card/95 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {renderEditableField("name", product.name, "font-semibold text-foreground")}
          <span className="text-muted-foreground">|</span>
          {renderEditableField("medium", product.medium, "text-muted-foreground")}
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