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
import { OwnerOrdersView } from "@/components/owner-orders-view";
import {
  AdminCustomizeView, AdminInfoView, AdminStatusView, AdminDeliveryView,
  AdminDriversView, AdminMessagesView, AdminPrinterView, AdminPaymentView,
  AdminKitchenView, AdminKdsView, AdminDomainView, AdminIntegrationsView,
  AdminUsersView, AdminCustomersView, AdminReportsView, AdminStockView,
} from "@/components/admin-views";
import { SuperAdminLoginView } from "@/components/super-admin-login-view";
import { SuperAdminView } from "@/components/super-admin-view";

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
        {view === "owner-orders" && <OwnerOrdersView />}
        {view === "owner-settings" && <AdminInfoView />}
        {/* Admin views */}
        {view === "admin-customize" && <AdminCustomizeView />}
        {view === "admin-info" && <AdminInfoView />}
        {view === "admin-status" && <AdminStatusView />}
        {view === "admin-delivery" && <AdminDeliveryView />}
        {view === "admin-drivers" && <AdminDriversView />}
        {view === "admin-messages" && <AdminMessagesView />}
        {view === "admin-printer" && <AdminPrinterView />}
        {view === "admin-payment" && <AdminPaymentView />}
        {view === "admin-kitchen" && <AdminKitchenView />}
        {view === "admin-kds" && <AdminKdsView />}
        {view === "admin-domain" && <AdminDomainView />}
        {view === "admin-integrations" && <AdminIntegrationsView />}
        {view === "admin-users" && <AdminUsersView />}
        {view === "admin-customers" && <AdminCustomersView />}
        {view === "admin-reports" && <AdminReportsView />}
        {view === "admin-stock" && <AdminStockView />}
        {/* Super Admin */}
        {view === "super-admin-login" && <SuperAdminLoginView />}
        {view === "super-admin" && <SuperAdminView />}
      </main>
      <SiteFooter />
    </div>
  );
}
