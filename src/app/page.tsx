"use client";

import { useEffect } from "react";
import { useNav } from "@/lib/store";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HomeView } from "@/components/home-view";
import { StoreView } from "@/components/store-view";
import { CartView } from "@/components/cart-view";
import { CheckoutView } from "@/components/checkout-view";
import { OrdersView } from "@/components/orders-view";
import { AuthView } from "@/components/auth-view";
import { DashboardView } from "@/components/dashboard-view";
import { CreateStoreView } from "@/components/create-store-view";
import { OwnerMenuView } from "@/components/owner-menu-view";
import { OwnerSettingsView } from "@/components/owner-settings-view";
import { OwnerOrdersView } from "@/components/owner-orders-view";

export default function Home() {
  const { view } = useNav();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [view]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 flex flex-col">
        {view === "home" && <HomeView />}
        {view === "store" && <StoreView />}
        {view === "cart" && <CartView />}
        {view === "checkout" && <CheckoutView />}
        {view === "orders" && <OrdersView />}
        {view === "auth" && <AuthView />}
        {view === "dashboard" && <DashboardView />}
        {view === "create-store" && <CreateStoreView />}
        {view === "owner-menu" && <OwnerMenuView />}
        {view === "owner-settings" && <OwnerSettingsView />}
        {view === "owner-orders" && <OwnerOrdersView />}
      </main>
      <SiteFooter />
    </div>
  );
}
