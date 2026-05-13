import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "../components/site-header";

export const metadata: Metadata = {
  title: "Aurenza",
  description:
    "Creamos soluciones digitales para transformar ideas en productos reales.",
};

export default function AurenzaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1240px] px-4 py-10 lg:px-6 lg:py-14">{children}</main>
    </div>
  );
}
