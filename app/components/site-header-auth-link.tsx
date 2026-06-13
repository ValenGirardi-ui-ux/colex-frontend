"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/src/lib/supabase/client";

function sessionHasUser(session: Session | null): boolean {
  return Boolean(session?.user);
}

/** Icono de perfil: cabeza y hombros solo contorno (sin círculo exterior). */
function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8.85" r="3.45" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        d="M6.55 19.4c.95-2.85 2.95-4.25 5.45-4.25s4.5 1.4 5.45 4.25"
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

  const profileButtonClass =
    "inline-flex shrink-0 text-[#3f3f46] transition-colors hover:text-[#822020] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020]";

  if (!ready) {
    return (
      <span
        className={`${profileButtonClass} max-lg:hidden`}
        aria-busy="true"
        aria-label="Comprobando sesión"
      >
        <ProfileIcon className="h-8 w-8 animate-pulse opacity-40 lg:h-8 lg:w-8" />
      </span>
    );
  }

  if (signedIn) {
    return (
      <Link
        href="/perfil"
        aria-label={signedInLabel}
        className={`${profileButtonClass} max-lg:hidden`}
      >
        <ProfileIcon className="h-8 w-8 lg:h-8 lg:w-8" />
      </Link>
    );
  }

  const loginButtonClass =
    "inline-flex shrink-0 items-center justify-center rounded-full bg-[#822020] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#6d1b1b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020] sm:px-4 sm:text-sm sm:font-medium";

  return (
    <Link href="/login" aria-label={signedOutLabel} className={loginButtonClass}>
      <span className="hidden sm:inline">{signedOutLabel}</span>
      <span className="sm:hidden">Entrar</span>
    </Link>
  );
}
