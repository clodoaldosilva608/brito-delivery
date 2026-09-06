"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type View = "home" | "menu" | "admin" | "reservations" | "contact";

interface NavState {
  view: View;
  setView: (v: View) => void;
  tableToken: string | null;
  setTableToken: (t: string | null) => void;
  restaurantId: string | null;
  setRestaurantId: (id: string | null) => void;
}

export const useNav = create<NavState>()(
  persist(
    (set) => ({
      view: "home",
      setView: (v) => set({ view: v }),
      tableToken: null,
      setTableToken: (t) => set({ tableToken: t }),
      restaurantId: null,
      setRestaurantId: (id) => set({ restaurantId: id }),
    }),
    { name: "cluvi-nav" }
  )
);

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: qty }] };
        }),
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      updateQty: (productId, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId ? { ...i, quantity: qty } : i
                ),
        })),
      clear: () => set({ items: [] }),
      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
      subtotal: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
    }),
    { name: "cluvi-cart" }
  )
);

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
