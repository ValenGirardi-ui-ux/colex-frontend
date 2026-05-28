export function ContactSupportCard() {
  return (
    <section className="rounded-2xl border border-[#0A8FA1]/25 bg-[#E8F5F7] p-5 sm:p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-zinc-900">¿No encontraste lo que buscabas?</h3>
          <p className="mt-1 text-sm text-zinc-700 sm:text-base">
            Nuestro equipo puede ayudarte con cualquier consulta sobre tu cuenta, compras o publicaciones.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            className="rounded-lg bg-[#0A8FA1] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#087987] active:scale-[0.98]"
          >
            Contactar soporte
          </button>
          <button
            type="button"
            className="rounded-lg border border-[#0A8FA1]/30 bg-white px-4 py-2 text-sm font-medium text-[#0A8FA1] transition hover:border-[#0A8FA1]"
          >
            Reportar un problema
          </button>
        </div>
      </div>
    </section>
  );
}
