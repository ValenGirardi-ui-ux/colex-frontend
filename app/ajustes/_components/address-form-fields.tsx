"use client";

import type { AddressFormFields } from "@/src/lib/user-address-form";

export const addressInputClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#822020] focus:ring-2 focus:ring-[#822020]/20 sm:text-base";

export const addressLabelClass = "text-sm font-medium text-zinc-800";

type AddressFormFieldsProps = {
  form: AddressFormFields;
  onChange: (next: AddressFormFields) => void;
  disabled?: boolean;
  idPrefix?: string;
};

export function AddressFormFieldsEditor({
  form,
  onChange,
  disabled = false,
  idPrefix = "addr",
}: AddressFormFieldsProps) {
  const set = <K extends keyof AddressFormFields>(key: K, value: AddressFormFields[K]) => {
    onChange({ ...form, [key]: value });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <label htmlFor={`${idPrefix}-label`} className={addressLabelClass}>
          Nombre (ej. Casa, Colegio)
        </label>
        <input
          id={`${idPrefix}-label`}
          className={addressInputClass}
          value={form.label}
          onChange={(e) => set("label", e.target.value)}
          placeholder="Casa"
          required
          disabled={disabled}
        />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <label htmlFor={`${idPrefix}-street`} className={addressLabelClass}>
          Calle
        </label>
        <input
          id={`${idPrefix}-street`}
          className={addressInputClass}
          value={form.street}
          onChange={(e) => set("street", e.target.value)}
          placeholder="Av. Colón"
          required
          disabled={disabled}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`${idPrefix}-number`} className={addressLabelClass}>
          Número
        </label>
        <input
          id={`${idPrefix}-number`}
          className={addressInputClass}
          value={form.street_number}
          onChange={(e) => set("street_number", e.target.value)}
          placeholder="1234"
          required
          disabled={disabled}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`${idPrefix}-postal`} className={addressLabelClass}>
          Código postal
        </label>
        <input
          id={`${idPrefix}-postal`}
          className={addressInputClass}
          value={form.postal_code}
          onChange={(e) => set("postal_code", e.target.value)}
          placeholder="5000"
          required
          disabled={disabled}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`${idPrefix}-city`} className={addressLabelClass}>
          Ciudad
        </label>
        <input
          id={`${idPrefix}-city`}
          className={addressInputClass}
          value={form.city}
          onChange={(e) => set("city", e.target.value)}
          placeholder="Capital"
          required
          disabled={disabled}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`${idPrefix}-region`} className={addressLabelClass}>
          Provincia
        </label>
        <input
          id={`${idPrefix}-region`}
          className={addressInputClass}
          value={form.region}
          onChange={(e) => set("region", e.target.value)}
          placeholder="Córdoba"
          required
          disabled={disabled}
        />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <label htmlFor={`${idPrefix}-notes`} className={addressLabelClass}>
          Referencias (opcional)
        </label>
        <input
          id={`${idPrefix}-notes`}
          className={addressInputClass}
          value={form.address_notes}
          onChange={(e) => set("address_notes", e.target.value)}
          placeholder="Piso 3, Depto A, timbre rojo"
          disabled={disabled}
        />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <label htmlFor={`${idPrefix}-country`} className={addressLabelClass}>
          País
        </label>
        <input
          id={`${idPrefix}-country`}
          className={addressInputClass}
          value={form.country}
          onChange={(e) => set("country", e.target.value)}
          placeholder="Argentina"
          disabled={disabled}
        />
      </div>
      <p className="sm:col-span-2 text-xs leading-relaxed text-zinc-500">
        Envíos a domicilio solo dentro de Córdoba y hasta 100 km desde Córdoba Capital.
      </p>
    </div>
  );
}
