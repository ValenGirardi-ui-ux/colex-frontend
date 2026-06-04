"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/src/lib/supabase/client";

function sessionHasUser(session: Session | null): boolean {
  return Boolean(session?.user);
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
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
  );
}

/**
 * Enlace de auth en el header: “Iniciar sesión” → /login o icono de perfil → /perfil.
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

  const signedInLabel = "Tu perfil";
  const signedOutLabel = "Iniciar sesión";

  if (!ready) {
    return (
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg p-1.5 lg:p-2"
        aria-busy="true"
        aria-label="Comprobando sesión"
      >
        <span className="inline-block h-6 w-6 animate-pulse rounded-full bg-zinc-200 lg:h-8 lg:w-8" />
      </span>
    );
  }

  if (signedIn) {
    return (
      <Link
        href="/perfil"
        aria-label={signedInLabel}
        className="inline-flex p-1.5 text-zinc-800 transition hover:text-[#822020] lg:p-2"
      >
        <ProfileIcon className="h-6 w-6 lg:h-8 lg:w-8" />
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      aria-label={signedOutLabel}
      className="inline-flex items-center justify-center rounded-lg p-1.5 text-zinc-700 hover:bg-zinc-100 lg:px-2 lg:py-1 lg:text-sm"
    >
      <span className="hidden lg:inline">{signedOutLabel}</span>
      <span className="text-xs font-semibold text-[#822020] lg:hidden">Entrar</span>
    </Link>
  );
}
