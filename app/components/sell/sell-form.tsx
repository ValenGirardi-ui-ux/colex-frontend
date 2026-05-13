"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { SELL_CATEGORIES } from "@/src/data/categories";
import type { ProductCondition, ProductNewCondition, ProductUsedCondition, SellDeliveryMethod } from "@/src/types/product";

type PhotoItem = {
  id: string;
  file: File;
  previewUrl: string;
};

type FormErrors = {
  title?: string;
  description?: string;
  category?: string;
  condition?: string;
  newCondition?: string;
  usedCondition?: string;
  price?: string;
  location?: string;
  photos?: string;
  delivery?: string;
};

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#822020] focus:ring-2 focus:ring-[#822020]/20 sm:py-3.5 sm:text-base";
const labelClass = "text-sm font-medium text-zinc-800";
const errorTextClass = "text-sm text-red-600";

function parsePriceToPositiveInteger(raw: string): number | null {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;
  const n = parseInt(digits, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function SellForm() {
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState<ProductCondition | "">("");
  const [newCondition, setNewCondition] = useState<ProductNewCondition | "">("");
  const [usedCondition, setUsedCondition] = useState<ProductUsedCondition | "">("");
  const [price, setPrice] = useState("");
  const [institution, setInstitution] = useState("");
  const [sizeLabel, setSizeLabel] = useState("");
  const [location, setLocation] = useState("");
  const [delivery, setDelivery] = useState<SellDeliveryMethod | "">("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const [draftHint, setDraftHint] = useState(false);

  const photosRef = useRef(photos);
  photosRef.current = photos;

  useEffect(() => {
    return () => {
      photosRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, []);

  const revokeList = (items: PhotoItem[]) => {
    items.forEach((p) => URL.revokeObjectURL(p.previewUrl));
  };

  const addFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const next: PhotoItem[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.type.startsWith("image/")) continue;
      const id = `${file.name}-${file.size}-${Date.now()}-${i}`;
      next.push({ id, file, previewUrl: URL.createObjectURL(file) });
    }
    if (next.length) {
      setPhotos((prev) => [...prev, ...next]);
      setErrors((e) => ({ ...e, photos: undefined }));
    }
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const found = prev.find((p) => p.id === id);
      if (found) URL.revokeObjectURL(found.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  const resetForm = () => {
    setPhotos((prev) => {
      revokeList(prev);
      return [];
    });
    setTitle("");
    setDescription("");
    setCategory("");
    setCondition("");
    setNewCondition("");
    setUsedCondition("");
    setPrice("");
    setInstitution("");
    setSizeLabel("");
    setLocation("");
    setDelivery("");
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!title.trim()) e.title = "Ingresá un título.";
    if (!description.trim()) e.description = "Ingresá una descripción.";
    if (!category) e.category = "Elegí una categoría.";
    if (condition !== "nuevo" && condition !== "usado")
      e.condition = "Elegí si el producto es nuevo o usado.";
    if (condition === "nuevo" && newCondition !== "con_etiqueta" && newCondition !== "sin_etiqueta") {
      e.newCondition = "Indicá si el producto nuevo tiene etiqueta.";
    }
    if (
      condition === "usado" &&
      usedCondition !== "casi_nuevo" &&
      usedCondition !== "algo_desgastado" &&
      usedCondition !== "bastante_desgastado" &&
      usedCondition !== "roto"
    ) {
      e.usedCondition = "Indicá el estado del producto usado.";
    }
    if (!parsePriceToPositiveInteger(price)) e.price = "Ingresá un precio válido (solo números).";
    if (!location.trim()) e.location = "Ingresá la ubicación o zona de entrega.";
    if (photos.length === 0) e.photos = "Agregá al menos una foto del producto.";
    if (delivery !== "retiro" && delivery !== "envio" && delivery !== "ambos")
      e.delivery = "Elegí un método de entrega.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    setSuccess(false);
    if (!validate()) return;
    setSuccess(true);
    resetForm();
  };

  const handleDraft = () => {
    setDraftHint(true);
    window.setTimeout(() => setDraftHint(false), 4000);
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-3xl space-y-6 pb-10 sm:space-y-8"
    >
      {success && (
        <div
          role="status"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 sm:px-5 sm:text-base"
        >
          Tu producto fue preparado correctamente.
        </div>
      )}

      {draftHint && (
        <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-600">
          Próximamente vas a poder guardar borradores. Por ahora es solo un botón de demostración.
        </p>
      )}

      {Object.keys(errors).length > 0 && !success && (
        <p className="text-sm text-red-600" role="alert">
          Revisá los campos marcados abajo.
        </p>
      )}

      {/* Fotos */}
      <section
        className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-7"
        aria-labelledby={`${formId}-photos`}
      >
        <h2 id={`${formId}-photos`} className="text-lg font-semibold text-zinc-900 sm:text-xl">
          Fotos del producto
        </h2>
        <p className="mt-1 text-sm text-zinc-500 sm:text-base">
          Subí una o varias imágenes claras. Se guardan solo en tu dispositivo hasta publicar.
        </p>
        {errors.photos && <p className={`${errorTextClass} mt-2`}>{errors.photos}</p>}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(ev) => {
            addFiles(ev.target.files);
            ev.target.value = "";
          }}
        />

        <div className="mt-4 flex flex-col gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex min-h-[140px] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/50 px-4 py-6 text-sm text-zinc-600 transition hover:border-[#822020]/40 hover:bg-[#822020]/[0.04] hover:text-[#822020] sm:min-h-[160px] sm:text-base"
          >
            <span className="rounded-full bg-[#822020]/10 p-3 text-[#822020]">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
              </svg>
            </span>
            <span className="font-medium">Tocá para agregar fotos</span>
            <span className="text-xs text-zinc-400 sm:text-sm">JPG, PNG o WEBP</span>
          </button>

          {photos.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((p) => (
                <li key={p.id} className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.previewUrl} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(p.id)}
                    className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900/75 text-white shadow transition hover:bg-red-600"
                    aria-label="Quitar imagen"
                  >
                    <span className="text-lg leading-none">×</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Básico */}
      <section
        className="space-y-4 rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm sm:space-y-5 sm:p-7"
        aria-labelledby={`${formId}-basic`}
      >
        <h2 id={`${formId}-basic`} className="text-lg font-semibold text-zinc-900 sm:text-xl">
          Datos principales
        </h2>

        <div className="space-y-1.5">
          <label htmlFor={`${formId}-title`} className={labelClass}>
            Título del producto
          </label>
          <input
            id={`${formId}-title`}
            className={inputClass}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors((x) => ({ ...x, title: undefined }));
            }}
            placeholder="Ej. Mochila con ruedas, talle único"
          />
          {errors.title && <p className={errorTextClass}>{errors.title}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${formId}-desc`} className={labelClass}>
            Descripción
          </label>
          <textarea
            id={`${formId}-desc`}
            rows={5}
            className={`${inputClass} min-h-[120px] resize-y`}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setErrors((x) => ({ ...x, description: undefined }));
            }}
            placeholder="Contá el estado, medidas, marca, etc."
          />
          {errors.description && <p className={errorTextClass}>{errors.description}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${formId}-cat`} className={labelClass}>
            Categoría
          </label>
          <select
            id={`${formId}-cat`}
            className={inputClass}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setErrors((x) => ({ ...x, category: undefined }));
            }}
            aria-invalid={!!errors.category}
          >
            <option value="">Seleccioná…</option>
            {SELL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.category && <p className={errorTextClass}>{errors.category}</p>}
        </div>

        <fieldset>
          <legend className={`${labelClass} mb-2`}>Estado del producto</legend>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            {(
              [
                { v: "nuevo" as const, label: "Nuevo" },
                { v: "usado" as const, label: "Usado" },
              ] as const
            ).map(({ v, label }) => (
              <label
                key={v}
                className={`flex flex-1 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm sm:text-base ${
                  condition === v
                    ? "border-[#822020] bg-[#822020]/[0.08] text-[#822020]"
                    : "border-zinc-200 bg-zinc-50/50 text-zinc-800 hover:border-zinc-300"
                }`}
              >
                <input
                  type="radio"
                  name="condition"
                  value={v}
                  checked={condition === v}
                  onChange={() => {
                    setCondition(v);
                    setErrors((x) => ({ ...x, condition: undefined, newCondition: undefined, usedCondition: undefined }));
                    if (v === "usado") setNewCondition("");
                    if (v === "nuevo") setUsedCondition("");
                  }}
                  className="h-4 w-4 border-zinc-300 text-[#822020] focus:ring-[#822020]/30"
                />
                {label}
              </label>
            ))}
          </div>
          {errors.condition && <p className={`${errorTextClass} mt-2`}>{errors.condition}</p>}
          {condition === "nuevo" && (
            <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
              <p className="text-sm font-medium text-zinc-800 sm:text-base">Condición del producto nuevo</p>
              <div className="mt-3 space-y-2">
                {(
                  [
                    { v: "con_etiqueta" as const, label: "Con etiqueta" },
                    { v: "sin_etiqueta" as const, label: "Sin etiqueta" },
                  ] as const
                ).map(({ v, label }) => (
                  <label
                    key={v}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 hover:border-zinc-300"
                  >
                    <input
                      type="radio"
                      name="newCondition"
                      value={v}
                      checked={newCondition === v}
                      onChange={() => {
                        setNewCondition(v);
                        setErrors((x) => ({ ...x, newCondition: undefined }));
                      }}
                      className="h-4 w-4 border-zinc-300 text-[#822020] focus:ring-[#822020]/30"
                    />
                    {label}
                  </label>
                ))}
              </div>
              {errors.newCondition && <p className={`${errorTextClass} mt-2`}>{errors.newCondition}</p>}
            </div>
          )}
          {condition === "usado" && (
            <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
              <p className="text-sm font-medium text-zinc-800 sm:text-base">Estado del producto usado</p>
              <div className="mt-3 space-y-2">
                {(
                  [
                    { v: "casi_nuevo" as const, label: "Casi nuevo" },
                    { v: "algo_desgastado" as const, label: "Algo desgastado" },
                    { v: "bastante_desgastado" as const, label: "Bastante desgastado" },
                    { v: "roto" as const, label: "Roto" },
                  ] as const
                ).map(({ v, label }) => (
                  <label
                    key={v}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 hover:border-zinc-300"
                  >
                    <input
                      type="radio"
                      name="usedCondition"
                      value={v}
                      checked={usedCondition === v}
                      onChange={() => {
                        setUsedCondition(v);
                        setErrors((x) => ({ ...x, usedCondition: undefined }));
                      }}
                      className="h-4 w-4 border-zinc-300 text-[#822020] focus:ring-[#822020]/30"
                    />
                    {label}
                  </label>
                ))}
              </div>
              {errors.usedCondition && <p className={`${errorTextClass} mt-2`}>{errors.usedCondition}</p>}
            </div>
          )}
        </fieldset>

        <div className="space-y-1.5">
          <label htmlFor={`${formId}-price`} className={labelClass}>
            Precio
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500 sm:text-base">
              $
            </span>
            <input
              id={`${formId}-price`}
              className={`${inputClass} pl-8`}
              inputMode="numeric"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                setErrors((x) => ({ ...x, price: undefined }));
              }}
              placeholder="Ej. 45000 o 12.500"
            />
          </div>
          {errors.price && <p className={errorTextClass}>{errors.price}</p>}
        </div>
      </section>

      {/* Detalle y entrega */}
      <section
        className="space-y-4 rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm sm:space-y-5 sm:p-7"
        aria-labelledby={`${formId}-extra`}
      >
        <h2 id={`${formId}-extra`} className="text-lg font-semibold text-zinc-900 sm:text-xl">
          Detalle y entrega
        </h2>

        <div className="space-y-1.5">
          <label htmlFor={`${formId}-inst`} className={labelClass}>
            Institución o colegio <span className="font-normal text-zinc-500">(opcional)</span>
          </label>
          <input
            id={`${formId}-inst`}
            className={inputClass}
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="Colegio al que aplica el artículo"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${formId}-size`} className={labelClass}>
            Talle / talla <span className="font-normal text-zinc-500">(opcional)</span>
          </label>
          <input
            id={`${formId}-size`}
            className={inputClass}
            value={sizeLabel}
            onChange={(e) => setSizeLabel(e.target.value)}
            placeholder="Ej. 14, M, único…"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${formId}-loc`} className={labelClass}>
            Ubicación
          </label>
          <input
            id={`${formId}-loc`}
            className={inputClass}
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setErrors((x) => ({ ...x, location: undefined }));
            }}
            placeholder="Barrio, ciudad o zona (ej. Belgrano, CABA)"
          />
          {errors.location && <p className={errorTextClass}>{errors.location}</p>}
        </div>

        <fieldset>
          <legend className={`${labelClass} mb-2`}>Método de entrega</legend>
          <div className="space-y-2">
            {(
              [
                { v: "retiro" as const, label: "Retiro en persona", sub: "Coordinás punto de encuentro" },
                { v: "envio" as const, label: "Envío", sub: "Acordás envío con el comprador" },
                { v: "ambos" as const, label: "Ambos", sub: "Retiro o envío, según lo acordado" },
              ] as const
            ).map(({ v, label, sub }) => (
              <label
                key={v}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 sm:items-center ${
                  delivery === v
                    ? "border-[#822020] bg-[#822020]/[0.08]"
                    : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300"
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  value={v}
                  checked={delivery === v}
                  onChange={() => {
                    setDelivery(v);
                    setErrors((x) => ({ ...x, delivery: undefined }));
                  }}
                  className="mt-0.5 h-4 w-4 text-[#822020] focus:ring-[#822020]/30 sm:mt-0"
                />
                <span>
                  <span className={`block text-sm font-medium sm:text-base ${delivery === v ? "text-[#822020]" : "text-zinc-900"}`}>
                    {label}
                  </span>
                  <span className="text-xs text-zinc-500 sm:text-sm">{sub}</span>
                </span>
              </label>
            ))}
          </div>
          {errors.delivery && <p className={`${errorTextClass} mt-2`}>{errors.delivery}</p>}
        </fieldset>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-4">
        <button
          type="button"
          onClick={handleDraft}
          className="order-2 rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50 sm:order-1 sm:px-8 sm:text-base"
        >
          Guardar borrador
        </button>
        <button
          type="submit"
          className="order-1 rounded-full bg-[#822020] px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#6d1b1b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020] sm:order-2 sm:px-10 sm:text-base"
        >
          Publicar producto
        </button>
      </div>
    </form>
  );
}
