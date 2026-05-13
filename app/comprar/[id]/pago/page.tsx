"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import { SiteHeader } from "@/app/components/site-header";
import { getProductDetailById } from "@/src/data/mockProducts";
import { formatArsPrice } from "@/src/lib/money";

type PageProps = {
  params: Promise<{ id: string }>;
};

type FormState = {
  holderName: string;
  cardNumber: string;
  expiration: string;
  cvv: string;
  dni: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const INITIAL_FORM: FormState = {
  holderName: "",
  cardNumber: "",
  expiration: "",
  cvv: "",
  dni: "",
};

export default function ComprarPagoPage({ params }: PageProps) {
  const { id } = use(params);
  const product = getProductDetailById(id);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSuccess, setIsSuccess] = useState(false);

  if (!product) {
    notFound();
  }

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};
    if (!form.holderName.trim()) nextErrors.holderName = "Ingresá el nombre del titular.";
    if (!form.cardNumber.trim()) nextErrors.cardNumber = "Ingresá el número de tarjeta.";
    if (!form.expiration.trim()) nextErrors.expiration = "Ingresá el vencimiento.";
    if (!form.cvv.trim()) nextErrors.cvv = "Ingresá el CVV.";
    return nextErrors;
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setIsSuccess(true);
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-zinc-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1240px] px-4 py-6 lg:px-6 lg:py-8">
        <div className="mb-5 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="transition hover:text-[#822020]">
            Inicio
          </Link>
          <span>/</span>
          <Link href={`/producto/${encodeURIComponent(product.id)}`} className="transition hover:text-[#822020]">
            Producto
          </Link>
          <span>/</span>
          <span className="text-zinc-700">Pago</span>
        </div>

        {isSuccess ? (
          <section className="mx-auto max-w-2xl rounded-3xl border border-zinc-200/90 bg-white p-8 text-center shadow-sm">
            <h1 className="text-3xl font-bold text-[#822020]">Compra realizada</h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 sm:text-base">
              Tu compra fue registrada correctamente. Te avisaremos cuando el vendedor confirme el pedido.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href={`/producto/${encodeURIComponent(product.id)}`}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#822020]/30 px-6 text-sm font-semibold text-[#822020] transition hover:bg-[#822020]/[0.05]"
              >
                Volver al producto
              </Link>
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#822020] px-6 text-sm font-semibold text-white transition hover:bg-[#6d1b1b]"
              >
                Ir al inicio
              </Link>
            </div>
          </section>
        ) : (
          <section className="grid gap-6 rounded-3xl border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6 lg:grid-cols-[1fr_420px]">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">Datos de pago</h1>
              <p className="text-sm text-zinc-600 sm:text-base">Completá la tarjeta para finalizar la compra.</p>

              <form className="space-y-4" onSubmit={onSubmit} noValidate>
                <label className="block text-sm">
                  <span className="mb-1 block text-zinc-600">Nombre del titular</span>
                  <input
                    type="text"
                    value={form.holderName}
                    onChange={(e) => updateField("holderName", e.target.value)}
                    className="h-11 w-full rounded-xl border border-zinc-300 px-3 outline-none transition focus:border-[#822020]"
                  />
                  {errors.holderName ? <span className="mt-1 block text-xs text-[#822020]">{errors.holderName}</span> : null}
                </label>

                <label className="block text-sm">
                  <span className="mb-1 block text-zinc-600">Número de tarjeta</span>
                  <input
                    type="text"
                    value={form.cardNumber}
                    onChange={(e) => updateField("cardNumber", e.target.value)}
                    inputMode="numeric"
                    className="h-11 w-full rounded-xl border border-zinc-300 px-3 outline-none transition focus:border-[#822020]"
                  />
                  {errors.cardNumber ? <span className="mt-1 block text-xs text-[#822020]">{errors.cardNumber}</span> : null}
                </label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-1 block text-zinc-600">Vencimiento</span>
                    <input
                      type="text"
                      value={form.expiration}
                      onChange={(e) => updateField("expiration", e.target.value)}
                      placeholder="MM/AA"
                      className="h-11 w-full rounded-xl border border-zinc-300 px-3 outline-none transition focus:border-[#822020]"
                    />
                    {errors.expiration ? <span className="mt-1 block text-xs text-[#822020]">{errors.expiration}</span> : null}
                  </label>

                  <label className="block text-sm">
                    <span className="mb-1 block text-zinc-600">CVV</span>
                    <input
                      type="password"
                      value={form.cvv}
                      onChange={(e) => updateField("cvv", e.target.value)}
                      inputMode="numeric"
                      className="h-11 w-full rounded-xl border border-zinc-300 px-3 outline-none transition focus:border-[#822020]"
                    />
                    {errors.cvv ? <span className="mt-1 block text-xs text-[#822020]">{errors.cvv}</span> : null}
                  </label>
                </div>

                <label className="block text-sm">
                  <span className="mb-1 block text-zinc-600">DNI (opcional)</span>
                  <input
                    type="text"
                    value={form.dni}
                    onChange={(e) => updateField("dni", e.target.value)}
                    inputMode="numeric"
                    className="h-11 w-full rounded-xl border border-zinc-300 px-3 outline-none transition focus:border-[#822020]"
                  />
                </label>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <button
                    type="submit"
                    className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#822020] px-6 text-sm font-semibold text-white transition hover:bg-[#6d1b1b]"
                  >
                    Comprar
                  </button>
                  <Link
                    href={`/comprar/${encodeURIComponent(product.id)}`}
                    className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#822020]/30 bg-white px-6 text-sm font-semibold text-[#822020] transition hover:bg-[#822020]/[0.05]"
                  >
                    Volver
                  </Link>
                </div>
              </form>
            </div>

            <aside className="rounded-2xl border border-zinc-200/90 bg-zinc-50/70 p-5">
              <h2 className="text-lg font-semibold text-zinc-900">Resumen corto del producto</h2>
              <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                {product.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.images[0]} alt="" className="aspect-square w-full object-cover" />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-[#822020]/[0.08] to-zinc-100 text-[#822020]/35">
                    <svg viewBox="0 0 24 24" className="h-14 w-14" fill="none" stroke="currentColor" strokeWidth="1.3">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-2 text-sm text-zinc-700">
                <p className="font-semibold text-zinc-900">{product.title}</p>
                <p className="text-xl font-bold text-zinc-900">{formatArsPrice(product.price)}</p>
              </div>
            </aside>
          </section>
        )}
      </main>
    </div>
  );
}
