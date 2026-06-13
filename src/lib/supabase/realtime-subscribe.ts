import type { RealtimeChannel } from "@supabase/supabase-js";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { hasSupabaseEnv, supabase } from "@/src/lib/supabase/client";

export type PostgresChangeBinding = {
  event: "INSERT" | "UPDATE" | "DELETE" | "*";
  schema?: string;
  table: string;
  filter?: string;
};

export type RealtimeRowPayload = RealtimePostgresChangesPayload<Record<string, unknown>>;

function realtimeTopicForName(channelName: string): string {
  return `realtime:${channelName}`;
}

function findChannelByName(channelName: string): RealtimeChannel | undefined {
  const topic = realtimeTopicForName(channelName);
  return supabase.getChannels().find((c) => c.topic === topic);
}

async function removeChannelByName(channelName: string): Promise<void> {
  const existing = findChannelByName(channelName);
  if (existing) {
    await supabase.removeChannel(existing);
  }
}

/**
 * Suscribe a cambios Postgres vía Supabase Realtime. Devuelve cleanup para desmontar.
 * Todos los `.on()` se registran antes de `.subscribe()`. Si el canal ya existe, se recrea.
 */
export function subscribePostgresChanges(
  channelName: string,
  bindings: PostgresChangeBinding[],
  handler: (payload: RealtimeRowPayload) => void,
): () => void {
  if (!hasSupabaseEnv || bindings.length === 0) {
    return () => {};
  }

  let channel: RealtimeChannel | null = null;
  let cancelled = false;

  void (async () => {
    try {
      await removeChannelByName(channelName);
      if (cancelled) return;

      const nextChannel = supabase.channel(channelName);

      for (const binding of bindings) {
        nextChannel.on(
          "postgres_changes",
          {
            event: binding.event,
            schema: binding.schema ?? "public",
            table: binding.table,
            filter: binding.filter,
          },
          (payload) => {
            try {
              handler(payload as RealtimeRowPayload);
            } catch (error) {
              console.warn("[Colex realtime] handler error", channelName, error);
            }
          },
        );
      }

      nextChannel.subscribe((status, err) => {
        if (status === "CHANNEL_ERROR") {
          console.warn("[Colex realtime] channel error", channelName, err?.message ?? status);
        } else if (status === "TIMED_OUT") {
          console.warn("[Colex realtime] channel timed out", channelName);
        }
      });

      if (cancelled) {
        await supabase.removeChannel(nextChannel);
        return;
      }

      channel = nextChannel;
    } catch (error) {
      console.warn("[Colex realtime] subscribe failed", channelName, error);
    }
  })();

  return () => {
    cancelled = true;
    const active = channel ?? findChannelByName(channelName);
    if (active) {
      void supabase.removeChannel(active);
    }
  };
}
