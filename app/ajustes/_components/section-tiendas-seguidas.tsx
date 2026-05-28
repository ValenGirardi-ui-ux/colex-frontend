"use client";

import { FollowedStoresPanel } from "@/app/components/shop/followed-stores-panel";
import { useEffect, useState, type ReactNode } from "react";

function PanelCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-5 sm:p-6">{children}</div>
  );
}

export function SectionTiendasSeguidas() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { getCurrentUser } = await import("@/src/services/auth");
      const user = await getCurrentUser();
      if (cancelled) return;
      setUserId(user?.id ?? null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6 text-sm text-zinc-500">
        Cargando tiendas que seguís…
      </div>
    );
  }

  if (!userId) {
    return (
      <PanelCard>
        <p className="text-sm text-zinc-600">Iniciá sesión para ver las tiendas que seguís.</p>
      </PanelCard>
    );
  }

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-zinc-900 sm:text-2xl">Tiendas que seguís</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Recibí novedades cuando tus tiendas favoritas publiquen productos.
        </p>
      </header>
      <FollowedStoresPanel userId={userId} />
    </section>
  );
}
