"use client";

import { useEffect } from "react";
import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { adminNavSections, customerNavSections } from "@/lib/dashboard-nav";

export default function DashboardShell({
  children,
  variant = "admin",
  badge,
  basePath,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const navSections =
    variant === "customer" ? customerNavSections : adminNavSections;
  const sidebarProps = { navSections, badge, basePath };

  return (
    <div className="flex min-h-screen bg-cream text-[#1A1A1A]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-[#E5E5E5] lg:block">
        <Sidebar {...sidebarProps} />
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          sidebarOpen ? "" : "pointer-events-none"
        }`}
        aria-hidden={!sidebarOpen}
      >
        <div
          onClick={() => setSidebarOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute top-0 left-0 h-full w-72 max-w-[85vw] border-r border-[#E5E5E5] bg-white shadow-2xl transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar
            {...sidebarProps}
            onNavigate={() => setSidebarOpen(false)}
          />
        </aside>
      </div>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} basePath={basePath} />
        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
