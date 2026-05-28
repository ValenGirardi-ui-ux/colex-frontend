"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ensureConversationWithPeer } from "@/src/services/conversations";
import { supabase } from "@/src/lib/supabase/client";

type StartPeerConversationButtonProps = {
  peerUserId: string;
  peerDisplayName: string;
  /** Ruta para volver tras login (p. ej. `/perfil/uuid`). */
  returnPath: string;
  className?: string;
  children: React.ReactNode;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function StartPeerConversationButton({
  peerUserId,
  peerDisplayName,
  returnPath,
  className,
  children,
}: StartPeerConversationButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        router.push(`/login?next=${encodeURIComponent(returnPath)}`);
        return;
      }

      if (session.user.id === peerUserId) {
        setError("No podés enviarte mensajes a vos mismo.");
        return;
      }

      if (!isUuid(peerUserId)) {
        router.push(`/mensajes?error=${encodeURIComponent("demo-no-chat")}`);
        return;
      }

      const { conversationId, error: chatError } = await ensureConversationWithPeer({
        currentUserId: session.user.id,
        peerUserId,
        peerDisplayName,
      });

      if (conversationId) {
        router.push(`/mensajes?conv=${encodeURIComponent(conversationId)}`);
        return;
      }

      setError(chatError ?? "No se pudo abrir el chat.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <button type="button" onClick={() => void handleClick()} disabled={loading} className={className}>
        {loading ? "Abriendo chat…" : children}
      </button>
      {error ? (
        <p role="alert" className="text-center text-sm text-[#822020]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
