"use client";



import Link from "next/link";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AddressMissingAlert } from "@/app/components/addresses/address-missing-alert";
import { notifyUserAddressesChanged } from "@/app/components/addresses/use-user-saved-addresses";

import { AddressEditModal } from "@/app/ajustes/_components/address-edit-modal";

import { AddressFormFieldsEditor } from "@/app/ajustes/_components/address-form-fields";

import { validateAddressForHomeDelivery } from "@/src/lib/cordoba-shipping";

import {

  EMPTY_ADDRESS_FORM,

  type AddressFormFields,

  filterCompleteSavedAddresses,

  formatAddressDisplayLine,

  formFieldsToPayload,

  validateAddressFormFields,

} from "@/src/lib/user-address-form";

import {

  createUserAddress,

  deleteUserAddress,

  fetchUserAddresses,

  formatAddressErrorForUser,

  isUserAddressesSchemaError,

  updateUserAddress,

} from "@/src/services/addresses";

import type { UserAddress } from "@/src/types/address";



const btnPrimaryClass =

  "rounded-full bg-[#822020] px-8 py-2.5 text-sm font-medium text-white transition hover:bg-[#6d1b1b] active:bg-[#5a1616] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020] disabled:cursor-not-allowed disabled:opacity-60 sm:py-3 sm:text-base";



const btnGhostClass =

  "rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 sm:py-3 sm:text-base";



function PanelCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-zinc-200 bg-zinc-50/80 p-5 sm:p-6 ${className}`}>{children}</div>
  );
}



function AddressCard({

  address,

  deleting,

  onDelete,

  onEdit,

}: {

  address: UserAddress;

  deleting: boolean;

  onDelete: (id: string) => void;

  onEdit: (address: UserAddress) => void;

}) {

  const displayLine = formatAddressDisplayLine(address);

  const shippingCheck = validateAddressForHomeDelivery({

    line1: displayLine,

    city: address.city,

    region: address.region,

  });



  return (

    <PanelCard>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

        <div className="min-w-0 flex-1">

          <p className="text-base font-semibold text-zinc-900">{address.label}</p>

          <p className="mt-1 text-sm text-zinc-700 sm:text-base">{displayLine}</p>

          <p className="text-sm text-zinc-600">

            {address.city}, {address.region} · CP {address.postal_code} · {address.country}

          </p>

          {shippingCheck.valid ? (

            <p className="mt-2 text-xs text-emerald-800">

              Envío a domicilio disponible

              {shippingCheck.distanceKm != null

                ? ` (${shippingCheck.distanceKm} km desde Córdoba Capital)`

                : ""}

            </p>

          ) : (

            <p className="mt-2 text-xs text-[#822020]">{shippingCheck.error}</p>

          )}

        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">

          {address.is_default ? (

            <span className="rounded-full bg-[#822020]/10 px-3 py-1 text-xs font-medium text-[#822020]">

              Predeterminada

            </span>

          ) : null}

          <button

            type="button"

            disabled={deleting}

            onClick={() => onEdit(address)}

            className="text-sm font-medium text-[#822020] underline-offset-2 transition hover:underline disabled:opacity-50"

          >

            Editar

          </button>

          <button

            type="button"

            disabled={deleting}

            onClick={() => onDelete(address.id)}

            className="text-sm font-medium text-zinc-600 underline-offset-2 transition hover:text-[#822020] hover:underline disabled:opacity-50"

          >

            {deleting ? "Eliminando…" : "Eliminar"}

          </button>

        </div>

      </div>

    </PanelCard>

  );

}



export function SectionDirecciones() {

  const [authLoading, setAuthLoading] = useState(true);

  const [sessionMissing, setSessionMissing] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);

  const [addresses, setAddresses] = useState<UserAddress[]>([]);

  const [loadError, setLoadError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState<AddressFormFields>(EMPTY_ADDRESS_FORM);

  const [saveBusy, setSaveBusy] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  const [editBusy, setEditBusy] = useState(false);

  const [editFormError, setEditFormError] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const formSectionRef = useRef<HTMLFormElement>(null);

  const completeAddresses = useMemo(() => filterCompleteSavedAddresses(addresses), [addresses]);

  const focusAddAddressForm = useCallback(() => {
    setShowForm(true);
    setFeedback(null);
    requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const loadAddresses = useCallback(async (uid: string) => {

    const { addresses: list, error } = await fetchUserAddresses(uid);

    if (error) {

      setLoadError(formatAddressErrorForUser(error));

      setAddresses([]);

      return;

    }

    setLoadError(null);

    setAddresses(list);

  }, []);



  useEffect(() => {

    let cancelled = false;

    (async () => {

      const { getCurrentUser } = await import("@/src/services/auth");

      const user = await getCurrentUser();

      if (cancelled) return;

      if (!user) {

        setSessionMissing(true);

        setAuthLoading(false);

        return;

      }

      setUserId(user.id);

      setSessionMissing(false);

      await loadAddresses(user.id);

      if (!cancelled) setAuthLoading(false);

    })();

    return () => {

      cancelled = true;

    };

  }, [loadAddresses]);

  useEffect(() => {
    if (authLoading || sessionMissing) return;
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash !== "#colex-direcciones" && hash !== "#agregar-direccion") return;
    const root = document.getElementById("colex-direcciones");
    root?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (hash === "#agregar-direccion") focusAddAddressForm();
  }, [authLoading, sessionMissing, focusAddAddressForm]);

  async function handleCreateSubmit(e: React.FormEvent) {

    e.preventDefault();

    if (!userId || saveBusy) return;



    const validation = validateAddressFormFields(form);

    if (!validation.ok) {

      setFeedback({ type: "err", text: validation.error });

      return;

    }



    setSaveBusy(true);

    setFeedback(null);



    const { address, error } = await createUserAddress(userId, formFieldsToPayload(form));



    setSaveBusy(false);



    if (error || !address) {

      setFeedback({ type: "err", text: formatAddressErrorForUser(error ?? "Error al guardar") });

      return;

    }



    setAddresses((prev) => [address, ...prev.filter((a) => a.id !== address.id)]);

    setFeedback({ type: "ok", text: "Dirección guardada correctamente." });

    setForm(EMPTY_ADDRESS_FORM);

    setShowForm(false);

    notifyUserAddressesChanged();

  }



  async function handleEditSave(fields: AddressFormFields) {

    if (!userId || !editingAddress || editBusy) return;



    setEditBusy(true);

    setEditFormError(null);



    const { address, error } = await updateUserAddress(

      userId,

      editingAddress.id,

      formFieldsToPayload(fields),

    );



    setEditBusy(false);



    if (error || !address) {

      setEditFormError(formatAddressErrorForUser(error ?? "No se pudo actualizar la dirección."));

      return;

    }



    setAddresses((prev) => prev.map((a) => (a.id === address.id ? address : a)));

    setFeedback({ type: "ok", text: "Dirección actualizada correctamente." });

    setEditingAddress(null);

    setEditFormError(null);

    notifyUserAddressesChanged();

  }



  async function handleDelete(addressId: string) {

    if (!userId || deletingId) return;



    setDeletingId(addressId);

    setFeedback(null);



    const { error } = await deleteUserAddress(userId, addressId);



    setDeletingId(null);



    if (error) {

      setFeedback({ type: "err", text: formatAddressErrorForUser(error) });

      return;

    }



    setAddresses((prev) => prev.filter((a) => a.id !== addressId));

    setFeedback({ type: "ok", text: "Dirección eliminada." });

    notifyUserAddressesChanged();

  }



  const schemaMissing = loadError != null && isUserAddressesSchemaError(loadError);

  const showMissingAddressAlert =
    !authLoading && !sessionMissing && !schemaMissing && completeAddresses.length === 0;

  return (

    <div id="colex-direcciones" className="scroll-mt-24 space-y-6">

      <div>

        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">Direcciones</h2>

        <p className="mt-2 text-sm text-zinc-600 sm:text-base">

          Guardá direcciones para entregas o retiros. Podés agregar varias y elegir una por compra o venta.

        </p>

      </div>

      {showMissingAddressAlert ? (
        <AddressMissingAlert variant="direcciones" onAddAddress={focusAddAddressForm} />
      ) : null}

      {sessionMissing ? (

        <PanelCard>

          <p className="text-sm text-zinc-700">

            No hay sesión iniciada.{" "}

            <Link href="/login" className="font-semibold text-[#822020] underline-offset-2 hover:underline">

              Iniciá sesión

            </Link>{" "}

            para gestionar tus direcciones.

          </p>

        </PanelCard>

      ) : null}



      {feedback ? (

        <p

          role="status"

          className={`rounded-xl px-4 py-3 text-sm ${

            feedback.type === "ok"

              ? "border border-emerald-200 bg-emerald-50 text-emerald-900"

              : "border border-[#822020]/25 bg-[#822020]/10 text-[#6d1b1b]"

          }`}

        >

          {feedback.text}

        </p>

      ) : null}



      {authLoading ? (

        <p className="text-sm text-zinc-500" role="status">

          Cargando direcciones…

        </p>

      ) : null}



      {!authLoading && !sessionMissing && loadError && !schemaMissing ? (

        <p role="alert" className="rounded-xl border border-[#822020]/25 bg-[#822020]/10 px-4 py-3 text-sm text-[#6d1b1b]">

          {loadError}

        </p>

      ) : null}



      {schemaMissing ? (

        <PanelCard>

          <p className="text-sm text-zinc-700">{loadError}</p>

        </PanelCard>

      ) : null}



      {!authLoading && !sessionMissing && !schemaMissing ? (

        <>

          <ul className="space-y-4">

            {completeAddresses.map((address) => (

              <li key={address.id}>

                <AddressCard

                  address={address}

                  deleting={deletingId === address.id}

                  onDelete={handleDelete}

                  onEdit={(addr) => {

                    setEditingAddress(addr);

                    setEditFormError(null);

                    setFeedback(null);

                  }}

                />

              </li>

            ))}

          </ul>



          {showForm ? (

            <form

              ref={formSectionRef}

              id="colex-address-form"

              onSubmit={handleCreateSubmit}

              className="scroll-mt-24 max-w-2xl space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6"

            >

              <p className="text-sm font-medium text-zinc-800">Nueva dirección</p>

              <AddressFormFieldsEditor form={form} onChange={setForm} disabled={saveBusy} idPrefix="new-addr" />

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">

                <button type="submit" disabled={saveBusy} className={btnPrimaryClass}>

                  {saveBusy ? "Guardando…" : "Guardar dirección"}

                </button>

                <button

                  type="button"

                  disabled={saveBusy}

                  className={btnGhostClass}

                  onClick={() => {

                    setShowForm(false);

                    setForm(EMPTY_ADDRESS_FORM);

                  }}

                >

                  Cancelar

                </button>

              </div>

            </form>

          ) : (

            <button

              type="button"

              onClick={focusAddAddressForm}

              className="w-full rounded-2xl border-2 border-dashed border-zinc-300 py-4 text-sm font-medium text-zinc-700 transition hover:border-[#822020]/35 hover:bg-[#822020]/[0.04] hover:text-[#822020] sm:w-auto sm:px-8 sm:py-3"

            >

              Agregar dirección

            </button>

          )}

        </>

      ) : null}



      <AddressEditModal

        address={editingAddress}

        busy={editBusy}

        formError={editFormError}

        onClose={() => {

          if (editBusy) return;

          setEditingAddress(null);

          setEditFormError(null);

        }}

        onSave={handleEditSave}

      />

    </div>

  );

}

