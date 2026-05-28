import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Layout raíz de /admin: sin guard (el guard vive en (panel)/layout). */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
