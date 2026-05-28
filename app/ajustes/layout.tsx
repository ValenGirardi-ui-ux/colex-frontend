import type { ReactNode } from "react";
import { SiteHeader } from "../components/site-header";

export default function AjustesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      <SiteHeader />

      <main className="colex-page min-w-0">
        <section className="min-w-0 overflow-hidden rounded-xl border border-zinc-200 bg-white p-3 max-lg:p-4 lg:p-10">
          {children}
        </section>
      </main>
    </div>
  );
}
