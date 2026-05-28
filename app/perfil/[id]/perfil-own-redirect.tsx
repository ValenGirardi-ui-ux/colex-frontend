"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { supabase } from "@/src/lib/supabase/client";

type PerfilOwnRedirectProps = {
  profileUserId: string;
  children: ReactNode;
};

/** Si el visitante es el dueño del perfil, redirige a /perfil (vista editable). */
export function PerfilOwnRedirect({ profileUserId, children }: PerfilOwnRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session?.user?.id === profileUserId) {
        router.replace("/perfil");
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.id === profileUserId) {
        router.replace("/perfil");
      }
    });

    return () => {
      cancelled = true;
      authListener.subscription.unsubscribe();
    };
  }, [profileUserId, router]);

  return children;
}
