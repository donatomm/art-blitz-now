import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  getItemCount: () => number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "octowonders_cart";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

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
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to localStorage:", e);
    }
  }, [items]);

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
