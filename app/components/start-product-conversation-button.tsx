"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ensureProductConversation } from "@/src/services/conversations";
import { getProductById } from "@/src/services/products";
import { supabase } from "@/src/lib/supabase/client";

type StartProductConversationButtonProps = {
  productId: string;
  className?: string;
  children: React.ReactNode;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function StartProductConversationButton({
  productId,
  className,
  children,
}: StartProductConversationButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        router.push(`/login?next=${encodeURIComponent(`/producto/${encodeURIComponent(productId)}`)}`);
        return;
      }

      const product = await getProductById(productId);
      if (!product) {
        router.push("/mensajes");
        return;
      }
      if (!isUuid(product.user_id)) {
        router.push(`/mensajes?error=${encodeURIComponent("demo-no-chat")}`);
        return;
      }

      const { conversationId, error } = await ensureProductConversation({
        productId: product.id,
        productTitle: product.title,
        buyerId: session.user.id,
        sellerId: product.user_id,
        conversationType: "chat",
      });

      if (conversationId) {
        router.push(`/mensajes?conv=${encodeURIComponent(conversationId)}&tab=chat`);
        return;
      }

      router.push(`/mensajes?error=${encodeURIComponent(error ?? "chat")}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={() => void handleClick()} disabled={loading} className={className}>
      {loading ? "Abriendo chat…" : children}
    </button>
  );
}
