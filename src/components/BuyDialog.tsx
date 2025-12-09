import { useState } from "react";
import { Product, ProductSize } from "@/types/product";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail } from "lucide-react";

interface BuyDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BuyDialog = ({ product, open, onOpenChange }: BuyDialogProps) => {
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);

  if (!product) return null;

  const currentSize = selectedSize || product.sizes[0];

  const getWhatsAppLink = () => {
    const message = encodeURIComponent(
      `Hi! I'm interested in purchasing:\n\n${product.name}\n${product.medium}\nSize: ${currentSize.dimensions}\nPrice: €${currentSize.price}\n\nPlease let me know the next steps!`
    );
    return `https://wa.me/393666295174?text=${message}`;
  };

  const getEmailLink = () => {
    const subject = encodeURIComponent(`Inquiry: ${product.name}`);
    const body = encodeURIComponent(
      `Hi!\n\nI'm interested in purchasing:\n\n${product.name}\n${product.medium}\nSize: ${currentSize.dimensions}\nPrice: €${currentSize.price}\n\nPlease let me know the next steps!\n\nThank you!`
    );
    return `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-48 object-cover rounded-md"
          />
          <p className="text-sm text-muted-foreground">{product.medium}</p>

          <div className="space-y-2">
            <p className="text-sm font-medium">Seleziona Dimensione:</p>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((size) => (
                <Button
                  key={size.dimensions}
                  variant={currentSize.dimensions === size.dimensions ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSize(size)}
                  className="flex-1 min-w-[100px]"
                >
                  {size.dimensions} - €{size.price}
                </Button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t space-y-2">
            <p className="text-lg font-semibold">
              Total: €{currentSize.price}
            </p>
            <div className="flex gap-2">
              <Button asChild className="flex-1" variant="default">
                <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
              <Button asChild className="flex-1" variant="secondary">
                <a href={getEmailLink()}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyDialog;