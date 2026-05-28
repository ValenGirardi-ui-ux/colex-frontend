import type { ProductStatus } from "@/src/types/product";

export function listingStatusLabel(status: ProductStatus): string {
  switch (status) {
    case "active":
      return "Publicada";
    case "paused":
      return "Pausada";
    case "sold":
      return "Vendida";
    case "draft":
      return "Borrador";
    default:
      return status;
  }
}

export function listingStatusBadgeClass(status: ProductStatus): string {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-900 ring-emerald-200/80";
    case "paused":
      return "bg-amber-50 text-amber-900 ring-amber-200/80";
    case "sold":
      return "bg-zinc-100 text-zinc-700 ring-zinc-200/80";
    default:
      return "bg-zinc-100 text-zinc-700 ring-zinc-200/80";
  }
}
