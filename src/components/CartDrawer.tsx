import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Minus, Plus, Trash2, ShoppingCart, Loader2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CartDrawer = () => {
  const { items, removeFromCart, updateQuantity, clearCart, isCartOpen, setIsCartOpen } = useCart();
  const { data: products, isLoading: productsLoading } = useProducts({ enabled: isCartOpen });
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const { toast } = useToast();

  // Enrich cart items with fresh product data
  const enrichedItems = items.map((item) => {
    const product = products?.find((p) => p.id === item.productId);
    const size = product?.sizes.find((s) => s.dimensions === item.sizeDimensions);
    
    // Calculate effective price (deal price if enabled)
    const effectivePrice = size?.deal_label_enabled && size?.deal_price && size.deal_price > 0
      ? size.deal_price
      : size?.price || 0;

    return {
      ...item,
      product,
      size,
      effectivePrice,
      isValid: !!product && !!size && effectivePrice > 0,
    };
  });

  const validItems = enrichedItems.filter((item) => item.isValid);
  const invalidItems = enrichedItems.filter((item) => !item.isValid);

  const subtotal = validItems.reduce(
    (sum, item) => sum + item.effectivePrice * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (validItems.length === 0) return;

    setIsCheckoutLoading(true);
    try {
      const cartItems = validItems.map((item) => ({
        product_id: item.productId,
        size_dimensions: item.sizeDimensions,
        quantity: item.quantity,
      }));

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { items: cartItems },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.url) throw new Error("No checkout URL received");

      // Open Stripe Checkout in new tab
      window.open(data.url, "_blank");
    } catch (error) {
      console.error("Cart checkout error:", error);
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile avviare il pagamento. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" strokeWidth={1.5} />
            Carrello ({items.length})
          </SheetTitle>
        </SheetHeader>

        {/* Continue shopping link */}
        <button
          onClick={() => setIsCartOpen(false)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors -mt-2 mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Continua lo shopping
        </button>

        <div className="flex-1 overflow-y-auto py-4">
          {productsLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" strokeWidth={1.5} />
              <p>Il carrello è vuoto</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Invalid items warning */}
              {invalidItems.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                  {invalidItems.length} articolo/i non più disponibile/i e verrà rimosso/i.
                </div>
              )}

              {/* Valid cart items */}
              {validItems.map((item) => (
                <div
                  key={`${item.productId}-${item.sizeDimensions}`}
                  className="flex gap-3 p-3 bg-card rounded-lg border border-border"
                >
                  {/* Product image */}
                  <div className="w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-muted">
                    {item.product?.image_url && (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Product details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">
                      {item.product?.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">{item.sizeDimensions}</p>
                    <p className="text-sm font-semibold text-green-600">
                      €{item.effectivePrice}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          updateQuantity(item.productId, item.sizeDimensions, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          updateQuantity(item.productId, item.sizeDimensions, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeFromCart(item.productId, item.sizeDimensions)}
                      >
                        <Trash2 className="h-5 w-5" strokeWidth={2} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with totals and checkout */}
        {validItems.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotale</span>
              <span className="font-medium">€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Spedizione</span>
              <span className="font-medium text-green-600">Gratuita (Italia)</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Totale</span>
              <span className="text-green-600">€{subtotal.toFixed(2)}</span>
            </div>

            <Button
              variant="cta"
              onClick={handleCheckout}
              disabled={isCheckoutLoading}
              className="w-full h-12"
            >
              {isCheckoutLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Caricamento...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" strokeWidth={1.5} />
                  Procedi al Checkout
                </>
              )}
            </Button>

          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
