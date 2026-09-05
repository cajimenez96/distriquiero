import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, PurchaseType, CartItem } from '../types/index.ts';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  cartTotal: number;
  subtotalUnits: number;
  subtotalBulks: number;
  wholesaleSavings: number;
  addToCart: (product: Product, purchaseType: PurchaseType, quantity: number) => void;
  removeFromCart: (productId: string, purchaseType: PurchaseType) => void;
  updateQuantity: (productId: string, purchaseType: PurchaseType, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'distriquiero_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('Could not read cart from localStorage', e);
      return [];
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [items]);

  // Revalidate cart items against fresh catalog prices on initial load
  useEffect(() => {
    async function revalidateCartPrices() {
      try {
        const res = await fetch('/api/catalog');
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          const freshMap = new Map<string, Product>();
          data.products.forEach((p: Product) => freshMap.set(p._id, p));

          setItems((prev) => {
            if (prev.length === 0) return prev;
            let hasChanged = false;
            const updated = prev.map((item) => {
              const fresh = freshMap.get(item.product._id);
              if (fresh) {
                const isDifferent =
                  fresh.priceUnit !== item.product.priceUnit ||
                  fresh.priceBulk !== item.product.priceBulk ||
                  fresh.unitsPerBulk !== item.product.unitsPerBulk ||
                  fresh.isOffer !== item.product.isOffer ||
                  fresh.isPaused !== item.product.isPaused ||
                  fresh.title !== item.product.title;

                if (isDifferent) {
                  hasChanged = true;
                  return { ...item, product: fresh };
                }
              }
              return item;
            });
            return hasChanged ? updated : prev;
          });
        }
      } catch (e) {
        console.warn('Could not revalidate cart prices from server:', e);
      }
    }

    revalidateCartPrices();
  }, []);

  const addToCart = (product: Product, purchaseType: PurchaseType, quantity: number) => {
    if (quantity <= 0) return;
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.product._id === product._id && i.purchaseType === purchaseType
      );

      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += quantity;
        return copy;
      } else {
        return [...prev, { product, purchaseType, quantity }];
      }
    });
  };

  const removeFromCart = (productId: string, purchaseType: PurchaseType) => {
    setItems((prev) =>
      prev.filter((i) => !(i.product._id === productId && i.purchaseType === purchaseType))
    );
  };

  const updateQuantity = (productId: string, purchaseType: PurchaseType, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, purchaseType);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.product._id === productId && i.purchaseType === purchaseType) {
          return { ...i, quantity };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  // Calculations
  const { totalItems, cartTotal, subtotalUnits, subtotalBulks, wholesaleSavings } = useMemo(() => {
    let count = 0;
    let total = 0;
    let unitsTotal = 0;
    let bulksTotal = 0;
    let savings = 0;

    for (const item of items) {
      count += item.quantity;
      if (item.purchaseType === 'bulk') {
        const itemPrice = item.product.priceBulk * item.quantity;
        bulksTotal += itemPrice;
        total += itemPrice;

        // Savings compared to retail unit equivalent
        const retailEquivalent = item.product.priceUnit * item.product.unitsPerBulk * item.quantity;
        if (retailEquivalent > itemPrice) {
          savings += (retailEquivalent - itemPrice);
        }
      } else {
        const itemPrice = item.product.priceUnit * item.quantity;
        unitsTotal += itemPrice;
        total += itemPrice;
      }
    }

    return {
      totalItems: count,
      cartTotal: total,
      subtotalUnits: unitsTotal,
      subtotalBulks: bulksTotal,
      wholesaleSavings: savings
    };
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        cartTotal,
        subtotalUnits,
        subtotalBulks,
        wholesaleSavings,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
