import { notFound, redirect } from "next/navigation";
import { getProductById } from "@/src/services/products";

type PageProps = {
  params: Promise<{ id: string }>;
};

/** El pago está integrado en `/comprar/[id]`. */
export default async function ComprarPagoPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    notFound();
  }
  redirect(`/comprar/${encodeURIComponent(id)}`);
}
