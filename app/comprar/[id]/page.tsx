import { notFound } from "next/navigation";
import { ComprarCheckoutClient } from "./comprar-checkout-client";
import { getProductById } from "@/src/services/products";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ComprarProductoPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    notFound();
  }

  return <ComprarCheckoutClient product={product} />;
}
