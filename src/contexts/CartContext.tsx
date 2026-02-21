import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  productId: string;
  productName: string;
  variantId: string;
  variantSize: string;
  image: any; // ImageSourcePropType
  price: number;
  originalPrice: number;
  discount: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  getItemQuantity: (variantId: string) => number;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.variantId === item.variantId);
      
      if (existingItem) {
        // If item exists, increase quantity
        return prevItems.map((i) =>
          i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        // If item doesn't exist, add it with quantity 1
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      removeFromCart(variantId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.variantId === variantId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (variantId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.variantId !== variantId)
    );
  };

  const getItemQuantity = (variantId: string): number => {
    const item = cartItems.find((i) => i.variantId === variantId);
    return item ? item.quantity : 0;
  };

  const getTotalPrice = (): number => {
    return cartItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  };

  const getTotalItems = (): number => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const value: CartContextType = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    getItemQuantity,
    getTotalPrice,
    getTotalItems,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

