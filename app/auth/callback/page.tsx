import { Suspense } from "react";
import { AuthCallbackClient } from "./auth-callback-client";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F6F6F6] text-sm text-zinc-600">
          Verificando enlace…
        </div>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}
