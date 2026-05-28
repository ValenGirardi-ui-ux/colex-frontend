"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function ProductPublishBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get("publicado") !== "1") return null;

  return (
    <div
      role="status"
      className="border-b border-emerald-200/80 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 lg:px-6"
    >
      <p className="mx-auto max-w-[1240px]">
        <span className="font-semibold">¡Publicación creada!</span> Tu producto ya está visible en Colex.{" "}
        <Link href="/perfil" className="font-medium underline underline-offset-2">
          Ver mi perfil
        </Link>
      </p>
    </div>
  );
}
