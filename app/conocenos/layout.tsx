import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "../components/site-header";

export const metadata: Metadata = {
  title: "Conocé Colex",
  description:
    "Una plataforma para comprar y vender artículos escolares e institucionales, nuevos o usados.",
};

export default function ConocenosLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-zinc-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1240px] px-4 py-8 lg:px-6 lg:py-12">
        {children}
      </main>
    </div>
  );
}
