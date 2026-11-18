import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { Cart } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (role !== 'CUSTOMER' || !token) {
      setCart(null);
      return;
    }
    try {
      setIsLoading(true);
      const data = await api.getCart();
      setCart(data);
    } catch (e) {
      console.warn('Could not fetch cart:', e);
    } finally {
      setIsLoading(false);
    }
  }, [role, token]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    const updated = await api.addToCart(productId, quantity);
    setCart(updated);
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    const updated = await api.updateCartItem(cartItemId, quantity);
    setCart(updated);
  };

  const removeItem = async (cartItemId: string) => {
    const updated = await api.removeCartItem(cartItemId);
    setCart(updated);
  };

  const clearCart = async () => {
    await api.clearCart();
    setCart(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount: cart?.totalItems || 0,
        isLoading,
        refreshCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
