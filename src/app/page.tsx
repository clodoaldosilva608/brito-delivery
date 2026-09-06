"use client";

import { useEffect } from "react";
import { useNav } from "@/lib/store";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LandingView } from "@/components/landing-view";
import { MenuView } from "@/components/menu-view";
import { AdminView } from "@/components/admin-view";
import { ReservationsView } from "@/components/reservations-view";
import { ContactView } from "@/components/contact-view";

export default function Home() {
  const { view } = useNav();

  // Restore scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [view]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 flex flex-col">
        {view === "home" && <LandingView />}
        {view === "menu" && <MenuView />}
        {view === "admin" && <AdminView />}
        {view === "reservations" && <ReservationsView />}
        {view === "contact" && <ContactView />}
      </main>
      <SiteFooter />
    </div>
  );
}
