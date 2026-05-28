import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F6F6F6] text-sm text-zinc-600">
          Cargando…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
