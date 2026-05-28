"use client";

import { useEffect, useState } from "react";
import { AddressFormFieldsEditor } from "@/app/ajustes/_components/address-form-fields";
import {
  EMPTY_ADDRESS_FORM,
  type AddressFormFields,
  addressToFormFields,
  validateAddressFormFields,
} from "@/src/lib/user-address-form";
import type { UserAddress } from "@/src/types/address";

const btnPrimaryClass =
  "rounded-full bg-[#822020] px-8 py-2.5 text-sm font-medium text-white transition hover:bg-[#6d1b1b] disabled:cursor-not-allowed disabled:opacity-60 sm:py-3 sm:text-base";

const btnGhostClass =
  "rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 disabled:opacity-60 sm:py-3 sm:text-base";

type AddressEditModalProps = {
  address: UserAddress | null;
  busy: boolean;
  formError: string | null;
  onClose: () => void;
  onSave: (fields: AddressFormFields) => void;
};

export function AddressEditModal({ address, busy, formError, onClose, onSave }: AddressEditModalProps) {
  const [form, setForm] = useState<AddressFormFields>(EMPTY_ADDRESS_FORM);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      setForm(addressToFormFields(address));
      setLocalError(null);
    }
  }, [address]);

  if (!address) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validateAddressFormFields(form);
    if (!validation.ok) {
      setLocalError(validation.error);
      return;
    }
    setLocalError(null);
    onSave(form);
  }

  const displayError = localError ?? formError;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-900/45 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-address-title"
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-zinc-200 bg-white p-5 shadow-xl sm:rounded-3xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 id="edit-address-title" className="text-lg font-semibold text-zinc-900">
              Editar dirección
            </h3>
            <p className="mt-1 text-sm text-zinc-600">Modificá los datos y guardá los cambios.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {displayError ? (
          <p role="alert" className="mb-4 rounded-xl border border-[#822020]/25 bg-[#822020]/10 px-3 py-2 text-sm text-[#6d1b1b]">
            {displayError}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AddressFormFieldsEditor form={form} onChange={setForm} disabled={busy} idPrefix="edit-addr" />
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button type="submit" disabled={busy} className={btnPrimaryClass}>
              {busy ? "Guardando…" : "Guardar cambios"}
            </button>
            <button type="button" disabled={busy} onClick={onClose} className={btnGhostClass}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
