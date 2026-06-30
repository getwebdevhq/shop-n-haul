"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string; // product ID
  name: string;
  price: number;
  image: string;
  quantity: number;
  category?: string;
  variantId?: string | null;
  variantName?: string | null;
}

interface CartContextType {
  cart: CartItem[];
  wishlist: string[]; // list of product IDs
  isCartOpen: boolean;
  addToCart: (product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category?: string;
    variantId?: string | null;
    variantName?: string | null;
    quantity?: number;
  }) => void;
  removeFromCart: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string | null) => void;
  toggleWishlist: (productId: string) => void;
  setCartOpen: (open: boolean) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);

  // Load cart and wishlist from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("stashandhaul_cart");
    const savedWishlist = localStorage.getItem("stashandhaul_wishlist");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error(e);
      }
    }
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("stashandhaul_cart", JSON.stringify(cart));
  }, [cart]);

  // Save wishlist to localStorage
  useEffect(() => {
    localStorage.setItem("stashandhaul_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category?: string;
    variantId?: string | null;
    variantName?: string | null;
    quantity?: number;
  }) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.id === product.id && item.variantId === (product.variantId || null)
      );
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id && item.variantId === (product.variantId || null)
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      }
      return [
        ...prevCart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category || "",
          variantId: product.variantId || null,
          variantName: product.variantName || null,
          quantity: product.quantity || 1,
        },
      ];
    });
    setCartOpen(true); // Automatically slide open cart drawer for better feedback
  };

  const removeFromCart = (productId: string, variantId?: string | null) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item.id === productId && item.variantId === (variantId || null))
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string | null) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId && item.variantId === (variantId || null)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prevWishlist) => {
      if (prevWishlist.includes(productId)) {
        return prevWishlist.filter((id) => id !== productId);
      } else {
        return [...prevWishlist, productId];
      }
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        isCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleWishlist,
        setCartOpen,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
