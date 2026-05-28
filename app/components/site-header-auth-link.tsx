"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/src/lib/supabase/client";

function sessionHasUser(session: Session | null): boolean {
  return Boolean(session?.user);
}

/**
 * Enlace de auth en el header: “Iniciar sesión” → /login o “Tu cuenta” → /perfil.
 * Hidrata con getSession() y se mantiene al día con onAuthStateChange (p. ej. tras login/registro).
 */
export function SiteHeaderAuthLink() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;

    function apply(session: Session | null) {
      if (cancelled) return;
      setSignedIn(sessionHasUser(session));
      setReady(true);
    }

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      apply(session);
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      apply(session);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  const label = signedIn ? "Tu cuenta" : "Iniciar sesión";

  if (!ready) {
    return (
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg lg:min-w-[9.5rem] lg:px-2 lg:py-1"
        aria-busy="true"
        aria-label="Comprobando sesión"
      >
        <span className="inline-block h-4 w-4 animate-pulse rounded-full bg-zinc-200 lg:w-24 lg:rounded" />
      </span>
    );
  }

  return (
    <Link
      href={signedIn ? "/perfil" : "/login"}
      aria-label={label}
      className="inline-flex items-center justify-center gap-1 rounded-lg p-1.5 text-zinc-700 hover:bg-zinc-100 lg:px-2 lg:py-1 lg:text-sm"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 shrink-0 lg:hidden"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden
      >
        <circle cx="12" cy="9" r="3.25" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.5 19.25c.94-2.49 3.08-4.25 5.5-4.25s4.56 1.76 5.5 4.25"
        />
      </svg>
      <span className="hidden lg:inline">{label}</span>
    </Link>
  );
}
