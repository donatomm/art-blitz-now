import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { cartAfterPayment } from "@/lib/checkoutReceipt";

export interface CartItem {
  productId: string;
  sizeDimensions: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (productId: string, sizeDimensions: string, quantity?: number) => void;
  removeFromCart: (productId: string, sizeDimensions: string) => void;
  updateQuantity: (productId: string, sizeDimensions: string, quantity: number) => void;
  clearCart: () => void;
  completeCheckout: (sessionId: string) => void;
  isCartLoaded: boolean;
  getItemCount: () => number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "octowonders_cart";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartLoaded, setIsCartLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage:", e);
    }
    setIsCartLoaded(true);
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    if (!isCartLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to localStorage:", e);
    }
  }, [items, isCartLoaded]);

  const completeCheckout = useCallback((sessionId: string) => {
    if (!isCartLoaded) return;
    try {
      const key = "octowonders_receipt:" + sessionId;
      const receipt = JSON.parse(localStorage.getItem(key) || "null");
      if (!receipt || receipt.consumed || !Array.isArray(receipt.items)) return;
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(current)) return;
      const remaining = cartAfterPayment(current, receipt.items);
      // Persist consumption before clearing, so reloading an old receipt cannot
      // later clear a new cart that happens to contain the same artwork.
      localStorage.setItem(key, JSON.stringify({ consumed: true }));
      localStorage.removeItem("octowonders_checkout_attempt");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
      setItems(remaining);
    } catch { /* Preserve the cart on unavailable or malformed local storage. */ }
  }, [isCartLoaded]);

  useEffect(() => {
    const syncCart = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      try {
        const value = JSON.parse(event.newValue || "[]");
        if (Array.isArray(value)) setItems(value);
      } catch { /* Ignore malformed cross-tab storage. */ }
    };
    window.addEventListener("storage", syncCart);
    return () => window.removeEventListener("storage", syncCart);
  }, []);

  const addToCart = (productId: string, sizeDimensions: string, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find(
        (item) => item.productId === productId && item.sizeDimensions === sizeDimensions
      );
      if (existing) {
        return prev.map((item) =>
          item.productId === productId && item.sizeDimensions === sizeDimensions
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId, sizeDimensions, quantity }];
    });
  };

  const removeFromCart = (productId: string, sizeDimensions: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.sizeDimensions === sizeDimensions)
      )
    );
  };

  const updateQuantity = (productId: string, sizeDimensions: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, sizeDimensions);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId && item.sizeDimensions === sizeDimensions
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        completeCheckout,
        isCartLoaded,
        getItemCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// SSG-safe default values for when CartProvider is not available (during SSG)
const ssgSafeDefaults: CartContextType = {
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  completeCheckout: () => {},
  isCartLoaded: false,
  getItemCount: () => 0,
  isCartOpen: false,
  setIsCartOpen: () => {},
};

export const useCart = () => {
  const context = useContext(CartContext);
  // Return SSG-safe defaults when context is not available (during static generation)
  if (!context) {
    return ssgSafeDefaults;
  }
  return context;
};
