"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/app/components/site-header";
import { formatAuthErrorForUser } from "@/src/services/auth";
import { supabase } from "@/src/lib/supabase/client";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/login/restablecer";
  }
  return raw;
}

export function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function handleCallback() {
      const next = safeNextPath(searchParams.get("next"));
      const code = searchParams.get("code");

      try {
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (cancelled) return;
          if (exchangeError) {
            setError(formatAuthErrorForUser(exchangeError.message, exchangeError.code));
            setWorking(false);
            return;
          }
          router.replace(next);
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (cancelled) return;
        if (session) {
          router.replace(next);
          return;
        }

        setError("El enlace no es válido o ya expiró. Pedí uno nuevo desde «Olvidé mi contraseña».");
        setWorking(false);
      } catch (unexpected) {
        if (cancelled) return;
        setError(
          formatAuthErrorForUser(
            unexpected instanceof Error ? unexpected.message : String(unexpected),
          ),
        );
        setWorking(false);
      }
    }

    void handleCallback();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md px-4 py-16 text-center">
        {working && !error ? (
          <p className="text-sm text-zinc-600 sm:text-base" role="status">
            Verificando enlace…
          </p>
        ) : null}
        {error ? (
          <div className="space-y-4">
            <p role="alert" className="rounded-xl border border-[#822020]/25 bg-[#822020]/10 px-4 py-3 text-sm text-[#6d1b1b]">
              {error}
            </p>
            <Link
              href="/login/olvide"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#822020] px-6 text-sm font-semibold text-white hover:bg-[#6d1b1b]"
            >
              Pedir nuevo enlace
            </Link>
          </div>
        ) : null}
      </main>
    </div>
  );
}
