"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ====== NAV ======
export type View =
  | "home"
  | "store"
  | "cart"
  | "checkout"
  | "orders"
  | "auth"
  | "dashboard"
  | "owner-orders"
  | "owner-menu"
  | "owner-settings"
  | "create-store"
  // New admin views
  | "admin-customize"
  | "admin-info"
  | "admin-status"
  | "admin-delivery"
  | "admin-drivers"
  | "admin-messages"
  | "admin-printer"
  | "admin-payment"
  | "admin-kitchen"
  | "admin-kds"
  | "admin-domain"
  | "admin-integrations"
  | "admin-users"
  | "admin-customers"
  | "admin-reports"
  | "admin-stock";

interface NavState {
  view: View;
  setView: (v: View) => void;
  goToStore: (slug: string) => void;
  // Store context
  storeSlug: string | null;
  setStoreSlug: (s: string | null) => void;
  // Owner dashboard context
  activeStoreId: string | null;
  setActiveStoreId: (id: string | null) => void;
}

export const useNav = create<NavState>()(
  persist(
    (set) => ({
      view: "home",
      setView: (v) => set({ view: v }),
      goToStore: (slug) => set({ storeSlug: slug, view: "store" }),
      storeSlug: null,
      setStoreSlug: (s) => set({ storeSlug: s }),
      activeStoreId: null,
      setActiveStoreId: (id) => set({ activeStoreId: id }),
    }),
    { name: "brito-nav" }
  )
);

// ====== CART ======
export interface CartItem {
  itemId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  notes?: string;
}

interface CartState {
  storeId: string | null;
  storeName: string | null;
  storeSlug: string | null;
  deliveryFee: number;
  minOrder: number;
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, store: { id: string; name: string; slug: string; deliveryFee: number; minOrder: number }, qty?: number) => boolean;
  remove: (itemId: string) => void;
  updateQty: (itemId: string, qty: number) => void;
  clear: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      storeId: null,
      storeName: null,
      storeSlug: null,
      deliveryFee: 0,
      minOrder: 0,
      items: [],
      add: (item, store, qty = 1) => {
        const state = get();
        // Bloquear multi-loja: se já tem itens de outra loja, não adiciona
        if (state.storeId && state.storeId !== store.id && state.items.length > 0) {
          return false;
        }
        set((s) => {
          const existing = s.items.find((i) => i.itemId === item.itemId);
          if (existing) {
            return {
              storeId: store.id,
              storeName: store.name,
              storeSlug: store.slug,
              deliveryFee: store.deliveryFee,
              minOrder: store.minOrder,
              items: s.items.map((i) =>
                i.itemId === item.itemId ? { ...i, quantity: i.quantity + qty } : i
              ),
            };
          }
          return {
            storeId: store.id,
            storeName: store.name,
            storeSlug: store.slug,
            deliveryFee: store.deliveryFee,
            minOrder: store.minOrder,
            items: [...s.items, { ...item, quantity: qty }],
          };
        });
        return true;
      },
      remove: (itemId) =>
        set((s) => ({
          items: s.items.filter((i) => i.itemId !== itemId),
        })),
      updateQty: (itemId, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.itemId !== itemId)
              : s.items.map((i) =>
                  i.itemId === itemId ? { ...i, quantity: qty } : i
                ),
        })),
      clear: () => set({ items: [], storeId: null, storeName: null, storeSlug: null, deliveryFee: 0, minOrder: 0 }),
      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
      subtotal: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
    }),
    { name: "brito-cart" }
  )
);

// ====== SESSION (client-side mirror) ======
interface SessionProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  roles: string[];
}

interface SessionState {
  profile: SessionProfile | null;
  loading: boolean;
  setProfile: (p: SessionProfile | null) => void;
  setLoading: (b: boolean) => void;
  refresh: () => Promise<void>;
}

export const useSession = create<SessionState>((set) => ({
  profile: null,
  loading: true,
  setProfile: (p) => set({ profile: p, loading: false }),
  setLoading: (b) => set({ loading: b }),
  refresh: async () => {
    try {
      set({ loading: true });
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      set({ profile: data.profile, loading: false });
    } catch {
      set({ profile: null, loading: false });
    }
  },
}));

export function formatBRL(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
