"use client";

import { useState } from "react";
import { AdminDashboardSection } from "@/app/admin/admin-dashboard-section";
import { AdminProductsSection } from "@/app/admin/admin-products-section";
import { AdminReportsSection } from "@/app/admin/admin-reports-section";
import { AdminUsersSection } from "@/app/admin/admin-users-section";
import type { AdminSection } from "@/src/types/admin";

const NAV: { id: AdminSection; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "usuarios", label: "Usuarios" },
  { id: "publicaciones", label: "Publicaciones" },
  { id: "reportes", label: "Reportes" },
];

export function AdminPanel() {
  const [section, setSection] = useState<AdminSection>("dashboard");

  return (
    <div className="space-y-6">
      <nav
        className="flex flex-wrap gap-2 rounded-2xl border border-zinc-200/90 bg-white p-2"
        aria-label="Secciones del panel admin"
      >
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSection(item.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              section === item.id
                ? "bg-[#822020] text-white"
                : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {section === "dashboard" ? <AdminDashboardSection /> : null}
      {section === "usuarios" ? <AdminUsersSection /> : null}
      {section === "publicaciones" ? <AdminProductsSection /> : null}
      {section === "reportes" ? <AdminReportsSection /> : null}
    </div>
  );
}
