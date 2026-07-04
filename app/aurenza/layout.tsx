import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Acerca de Colex",
  description:
    "Una plataforma para comprar y vender artículos escolares e institucionales, nuevos o usados.",
};

export default function AurenzaLegacyLayout({ children }: { children: ReactNode }) {
  return children;
}
