import type { ReactNode } from "react";
import { SiteHeader } from "../components/site-header";

export default function AjustesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1240px] px-4 py-6 lg:px-6 lg:py-8">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 lg:p-10">
          {children}
        </section>
      </main>
    </div>
  );
}
