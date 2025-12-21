import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

const CART_ENABLED = import.meta.env.VITE_ENABLE_CART === 'true';

const FloatingCartButton = () => {
  const { getItemCount, setIsCartOpen } = useCart();
  const itemCount = getItemCount();

  // Only show if cart is enabled AND there are items
  if (!CART_ENABLED || itemCount === 0) {
    return null;
  }

  return (
    <Button
      onClick={() => setIsCartOpen(true)}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-gold hover:bg-gold/90 text-primary-foreground"
      size="icon"
    >
      <ShoppingCart className="h-6 w-6 text-black" />
      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
        {itemCount > 9 ? "9+" : itemCount}
      </span>
    </Button>
  );
};

export default FloatingCartButton;
