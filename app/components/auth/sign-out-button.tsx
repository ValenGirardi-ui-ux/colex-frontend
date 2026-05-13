"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/src/services/auth";

const ghostBtnClass =
  "inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-[#822020]/30 hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020] disabled:opacity-60 sm:text-base";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setMsg(null);
    const { error } = await signOut();
    setPending(false);
    if (error) {
      setMsg(error);
      return;
    }
    router.refresh();
    router.push("/");
  }

  return (
    <div className="space-y-2">
      <button type="button" className={ghostBtnClass} onClick={handleClick} disabled={pending}>
        {pending ? "Cerrando sesión…" : "Cerrar sesión"}
      </button>
      {msg ? (
        <p className="text-sm text-[#822020]" role="alert">
          {msg}
        </p>
      ) : null}
    </div>
  );
}
