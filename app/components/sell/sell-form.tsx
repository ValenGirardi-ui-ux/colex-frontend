"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { SELL_CATEGORIES } from "@/src/data/categories";
import {
  normalizeSellDeliveryForForm,
  parseDeliveryMethodForPublish,
  SELL_DELIVERY_OPTIONS,
} from "@/src/lib/delivery-method";
import {
  clearLocalSellDraft,
  dataUrlToFile,
  fileToDataUrl,
  readLocalSellDraft,
  writeLocalSellDraft,
  type SellDraftPhotoStored,
  type SellDraftSnapshot,
} from "@/src/lib/sell-draft";
import { supabase } from "@/src/lib/supabase/client";
import { publishExistingDraft, saveProductDraft } from "@/src/services/product-drafts";
import { getOwnProductById } from "@/src/services/products";
import { updatePublishedListing } from "@/src/services/listing-management";
import { publishProduct } from "@/src/services/publish-product";
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
const AUTOSAVE_MS = 1400;

function parsePriceToPositiveInteger(raw: string): number | null {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;
  const n = parseInt(digits, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function parsePriceDigits(raw: string): number {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return 0;
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function hasFormContent(fields: {
  title: string;
  description: string;
  category: string;
  condition: string;
  price: string;
  brand: string;
  institution: string;
  sizeLabel: string;
  location: string;
  delivery: string;
  photoCount: number;
  remoteCount: number;
}): boolean {
  return (
    fields.title.trim().length > 0 ||
    fields.description.trim().length > 0 ||
    fields.category.length > 0 ||
    fields.condition.length > 0 ||
    fields.price.replace(/[^\d]/g, "").length > 0 ||
    fields.brand.trim().length > 0 ||
    fields.institution.trim().length > 0 ||
    fields.sizeLabel.trim().length > 0 ||
    fields.location.trim().length > 0 ||
    fields.delivery.length > 0 ||
    fields.photoCount > 0 ||
    fields.remoteCount > 0
  );
}

type SellFormProps = {
  /** Editar publicación activa o pausada del vendedor. */
  editProductId?: string;
};

export function SellForm({ editProductId }: SellFormProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = Boolean(editProductId);
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [authReady, setAuthReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [remoteImageUrls, setRemoteImageUrls] = useState<string[]>([]);
  const [draftLoadDone, setDraftLoadDone] = useState(false);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState<ProductCondition | "">("");
  const [newCondition, setNewCondition] = useState<ProductNewCondition | "">("");
  const [usedCondition, setUsedCondition] = useState<ProductUsedCondition | "">("");
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [institution, setInstitution] = useState("");
  const [sizeLabel, setSizeLabel] = useState("");
  const [location, setLocation] = useState("");
  const [delivery, setDelivery] = useState<SellDeliveryMethod | "">("ambos");

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);

  const skipAutosaveRef = useRef(true);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftSaveInFlightRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      setUserId(session?.user?.id ?? null);
      setAuthReady(true);
    }

    void loadSession();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
      setAuthReady(true);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

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

  const applySnapshot = useCallback(async (snapshot: SellDraftSnapshot, nextDraftId: string | null) => {
    skipAutosaveRef.current = true;
    setDraftId(nextDraftId);
    setTitle(snapshot.title);
    setDescription(snapshot.description);
    setCategory(snapshot.category);
    setCondition(snapshot.condition);
    setNewCondition(snapshot.newCondition);
    setUsedCondition(snapshot.usedCondition);
    setPrice(snapshot.price);
    setBrand(snapshot.brand);
    setInstitution(snapshot.institution);
    setSizeLabel(snapshot.sizeLabel);
    setLocation(snapshot.location);
    setDelivery(normalizeSellDeliveryForForm(snapshot.delivery) || "ambos");
    setRemoteImageUrls(snapshot.imageUrls);

    setPhotos((prev) => {
      revokeList(prev);
      return [];
    });

    if (snapshot.localPhotos.length > 0) {
      const loaded: PhotoItem[] = [];
      for (const stored of snapshot.localPhotos) {
        try {
          const file = await dataUrlToFile(stored.dataUrl, stored.name);
          loaded.push({
            id: stored.id,
            file,
            previewUrl: URL.createObjectURL(file),
          });
        } catch {
          // omit corrupt photo
        }
      }
      setPhotos(loaded);
    }

    window.setTimeout(() => {
      skipAutosaveRef.current = false;
    }, 0);
  }, []);

  useEffect(() => {
    if (!authReady) return;

    let cancelled = false;

    async function loadDraft() {
      skipAutosaveRef.current = true;

      if (isEditMode && editProductId && userId) {
        const product = await getOwnProductById(editProductId, userId);
        if (cancelled) return;
        if (
          product &&
          (product.status === "active" || product.status === "paused")
        ) {
          await applySnapshot(
            {
              version: 1,
              id: product.id,
              updatedAt: new Date().toISOString(),
              title: product.title,
              description: product.description ?? "",
              category: product.category === "Otros" ? "" : product.category,
              condition:
                product.condition === "nuevo" || product.condition === "usado"
                  ? product.condition
                  : "",
              newCondition: product.new_condition ?? "",
              usedCondition: product.used_condition ?? "",
              price: String(product.price),
              brand: product.brand ?? "",
              institution: product.institution ?? "",
              sizeLabel: product.size ?? "",
              location: product.location === "No indicada" ? "" : product.location,
              delivery: product.delivery_method ?? "",
              imageUrls: product.images ?? [],
              localPhotos: [],
            },
            null,
          );
          setDraftLoadDone(true);
          return;
        }
        setSubmitError("No encontramos esta publicación para editar.");
        setDraftLoadDone(true);
        return;
      }

      const borradorParam = searchParams.get("borrador");

      if (userId && borradorParam) {
        const product = await getOwnProductById(borradorParam, userId);
        if (cancelled) return;
        if (product && product.status === "draft") {
          await applySnapshot(
            {
              version: 1,
              id: product.id,
              updatedAt: new Date().toISOString(),
              title: product.title === "Sin título" ? "" : product.title,
              description: product.description ?? "",
              category: product.category === "Otros" ? "" : product.category,
              condition:
                product.condition === "nuevo" || product.condition === "usado" ? product.condition : "",
              newCondition: product.new_condition ?? "",
              usedCondition: product.used_condition ?? "",
              price: product.price > 0 ? String(product.price) : "",
              brand: product.brand ?? "",
              institution: product.institution ?? "",
              sizeLabel: product.size ?? "",
              location: product.location === "No indicada" ? "" : product.location,
              delivery: product.delivery_method ?? "",
              imageUrls: product.images ?? [],
              localPhotos: [],
            },
            product.id,
          );
          setDraftLoadDone(true);
          return;
        }
      }

      if (!userId) {
        const local = readLocalSellDraft();
        if (cancelled) return;
        if (local) {
          await applySnapshot(local, null);
        } else {
          skipAutosaveRef.current = false;
        }
        setDraftLoadDone(true);
        return;
      }

      if (!borradorParam) {
        const local = readLocalSellDraft();
        if (cancelled) return;
        if (local && hasFormContent({
          title: local.title,
          description: local.description,
          category: local.category,
          condition: local.condition,
          price: local.price,
          brand: local.brand,
          institution: local.institution,
          sizeLabel: local.sizeLabel,
          location: local.location,
          delivery: local.delivery,
          photoCount: local.localPhotos.length,
          remoteCount: local.imageUrls.length,
        })) {
          await applySnapshot(local, null);
        } else {
          skipAutosaveRef.current = false;
        }
      } else {
        skipAutosaveRef.current = false;
      }

      setDraftLoadDone(true);
    }

    void loadDraft();

    return () => {
      cancelled = true;
    };
  }, [authReady, userId, searchParams, applySnapshot, isEditMode, editProductId]);

  const buildSnapshot = useCallback(async (): Promise<SellDraftSnapshot> => {
    const localPhotos: SellDraftPhotoStored[] = [];
    for (const p of photos) {
      try {
        const dataUrl = await fileToDataUrl(p.file);
        localPhotos.push({ id: p.id, dataUrl, name: p.file.name || "foto.jpg" });
      } catch {
        // skip
      }
    }

    return {
      version: 1,
      id: draftId ?? "local",
      updatedAt: new Date().toISOString(),
      title,
      description,
      category,
      condition,
      newCondition,
      usedCondition,
      price,
      brand,
      institution,
      sizeLabel,
      location,
      delivery,
      imageUrls: remoteImageUrls,
      localPhotos,
    };
  }, [
    brand,
    category,
    condition,
    delivery,
    description,
    draftId,
    institution,
    location,
    newCondition,
    photos,
    price,
    remoteImageUrls,
    sizeLabel,
    title,
    usedCondition,
  ]);

  const persistDraft = useCallback(
    async (opts?: { silent?: boolean; requireAuth?: boolean }): Promise<boolean> => {
      const silent = opts?.silent ?? false;
      const requireAuth = opts?.requireAuth ?? false;

      if (requireAuth && !userId) {
        setDraftError("Iniciá sesión para guardar el borrador en tu cuenta.");
        setDraftNotice(null);
        return false;
      }

      if (draftSaveInFlightRef.current) {
        return false;
      }

      const content = hasFormContent({
        title,
        description,
        category,
        condition,
        price,
        brand,
        institution,
        sizeLabel,
        location,
        delivery,
        photoCount: photos.length,
        remoteCount: remoteImageUrls.length,
      });

      if (!content) {
        if (!silent) {
          setDraftNotice(null);
          setDraftError("Completá al menos un campo para guardar el borrador.");
        }
        return false;
      }

      if (!silent) {
        setSavingDraft(true);
        setDraftError(null);
        setDraftNotice(null);
      }

      draftSaveInFlightRef.current = true;

      try {
        if (!userId) {
          const snapshot = await buildSnapshot();
          writeLocalSellDraft(snapshot);
          if (!silent) {
            setDraftNotice("Borrador guardado en este dispositivo. Iniciá sesión para sincronizarlo en tu cuenta.");
            setDraftError(null);
          }
          return true;
        }

        const { product, error } = await saveProductDraft({
          userId,
          draftId,
          title,
          description,
          category,
          condition,
          newCondition,
          usedCondition,
          price: parsePriceDigits(price),
          brand: brand.trim() || null,
          institution: institution.trim() || null,
          size: sizeLabel.trim() || null,
          location,
          deliveryMethod: delivery ? parseDeliveryMethodForPublish(delivery) : null,
          existingImageUrls: remoteImageUrls,
          newImageFiles: photos.map((p) => p.file),
        });

        if (error || !product) {
          if (!silent) {
            setDraftError(error ?? "No se pudo guardar el borrador.");
            setDraftNotice(null);
          }
          return false;
        }

        clearLocalSellDraft();
        const previousDraftId = draftId;
        setDraftId(product.id);
        setRemoteImageUrls(product.images ?? []);
        setPhotos((prev) => {
          revokeList(prev);
          return [];
        });

        if (!previousDraftId && product.id) {
          router.replace(`/vender?borrador=${encodeURIComponent(product.id)}`, { scroll: false });
        }

        if (!silent) {
          setDraftNotice(
            "Borrador guardado correctamente en tu cuenta. Podés verlo en Perfil → Borradores.",
          );
          setDraftError(null);
        }
        return true;
      } catch (err) {
        console.error("[Colex vender] borrador", err);
        if (!silent) {
          setDraftError("Ocurrió un error al guardar el borrador.");
          setDraftNotice(null);
        }
        return false;
      } finally {
        draftSaveInFlightRef.current = false;
        if (!silent) setSavingDraft(false);
      }
    },
    [
      brand,
      buildSnapshot,
      category,
      condition,
      delivery,
      description,
      draftId,
      institution,
      location,
      newCondition,
      photos,
      price,
      remoteImageUrls,
      router,
      sizeLabel,
      title,
      usedCondition,
      userId,
    ],
  );

  useEffect(() => {
    if (isEditMode || !draftLoadDone || skipAutosaveRef.current) return;

    const content = hasFormContent({
      title,
      description,
      category,
      condition,
      price,
      brand,
      institution,
      sizeLabel,
      location,
      delivery,
      photoCount: photos.length,
      remoteCount: remoteImageUrls.length,
    });
    if (!content) return;

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      void persistDraft({ silent: true });
    }, AUTOSAVE_MS);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [
    draftLoadDone,
    title,
    description,
    category,
    condition,
    newCondition,
    usedCondition,
    price,
    brand,
    institution,
    sizeLabel,
    location,
    delivery,
    photos,
    remoteImageUrls,
    persistDraft,
    isEditMode,
  ]);

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

  const removeRemoteImage = (url: string) => {
    setRemoteImageUrls((prev) => prev.filter((u) => u !== url));
  };

  const resetForm = () => {
    setPhotos((prev) => {
      revokeList(prev);
      return [];
    });
    setRemoteImageUrls([]);
    setDraftId(null);
    setTitle("");
    setDescription("");
    setCategory("");
    setCondition("");
    setNewCondition("");
    setUsedCondition("");
    setPrice("");
    setBrand("");
    setInstitution("");
    setSizeLabel("");
    setLocation("");
    setDelivery("ambos");
    setErrors({});
    clearLocalSellDraft();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!title.trim()) e.title = "Ingresá un título.";
    if (!parsePriceToPositiveInteger(price)) e.price = "Ingresá un precio válido (solo números).";
    if (photos.length === 0 && remoteImageUrls.length === 0) {
      e.photos = "Agregá al menos una foto del producto.";
    }

    const cond = condition === "nuevo" ? "nuevo" : condition === "usado" ? "usado" : null;
    if (cond === "nuevo" && newCondition !== "con_etiqueta" && newCondition !== "sin_etiqueta") {
      e.newCondition = "Indicá si el producto nuevo tiene etiqueta.";
    }
    if (
      cond === "usado" &&
      usedCondition !== "casi_nuevo" &&
      usedCondition !== "algo_desgastado" &&
      usedCondition !== "bastante_desgastado" &&
      usedCondition !== "roto"
    ) {
      e.usedCondition = "Indicá el estado del producto usado.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setSubmitError(null);

    if (!userId) {
      router.push("/login?next=%2Fvender");
      return;
    }
    if (!validate()) return;

    const priceValue = parsePriceToPositiveInteger(price);
    if (!priceValue) return;

    const resolvedCondition: ProductCondition = condition === "nuevo" ? "nuevo" : "usado";
    const resolvedNew: ProductNewCondition | null =
      resolvedCondition === "nuevo"
        ? newCondition === "con_etiqueta" || newCondition === "sin_etiqueta"
          ? newCondition
          : "sin_etiqueta"
        : null;
    const resolvedUsed: ProductUsedCondition | null =
      resolvedCondition === "usado"
        ? usedCondition === "casi_nuevo" ||
          usedCondition === "algo_desgastado" ||
          usedCondition === "bastante_desgastado" ||
          usedCondition === "roto"
          ? usedCondition
          : "algo_desgastado"
        : null;

    setPublishing(true);
    try {
      if (isEditMode && editProductId) {
        const { product, error } = await updatePublishedListing(editProductId, userId, {
          userId,
          title,
          description,
          price: priceValue,
          category: category || "Otros",
          condition: resolvedCondition,
          newCondition: resolvedNew,
          usedCondition: resolvedUsed,
          institution: institution || null,
          brand: brand || null,
          size: sizeLabel || null,
          location: location || "No indicada",
          deliveryMethod: parseDeliveryMethodForPublish(delivery),
          imageFiles: photos.map((p) => p.file),
          existingImageUrls: remoteImageUrls,
        });

        if (error || !product) {
          setSubmitError(error ?? "No se pudieron guardar los cambios.");
          return;
        }

        router.push("/perfil?tab=publicaciones");
        return;
      }

      if (draftId) {
        const { product, error } = await publishExistingDraft(draftId, userId, {
          draftId,
          userId,
          title,
          description,
          category,
          condition,
          newCondition,
          usedCondition,
          price: priceValue,
          brand: brand.trim() || null,
          institution: institution.trim() || null,
          size: sizeLabel.trim() || null,
          location,
          deliveryMethod: parseDeliveryMethodForPublish(delivery),
          existingImageUrls: remoteImageUrls,
          newImageFiles: photos.map((p) => p.file),
          imageFiles: photos.map((p) => p.file),
        });

        if (error || !product) {
          setSubmitError(error ?? "No se pudo publicar el producto.");
          return;
        }

        resetForm();
        router.push(`/producto/${encodeURIComponent(product.id)}?publicado=1`);
        return;
      }

      const { product, error } = await publishProduct({
        userId,
        title,
        description,
        price: priceValue,
        category: category || "Otros",
        condition: resolvedCondition,
        newCondition: resolvedNew,
        usedCondition: resolvedUsed,
        institution: institution || null,
        brand: brand || null,
        size: sizeLabel || null,
        location: location || "No indicada",
        deliveryMethod: parseDeliveryMethodForPublish(delivery),
        imageFiles: photos.map((p) => p.file),
      });

      if (error || !product) {
        setSubmitError(error ?? "No se pudo publicar el producto.");
        return;
      }

      resetForm();
      router.push(`/producto/${encodeURIComponent(product.id)}?publicado=1`);
    } catch (err) {
      console.error("[Colex vender] publicar", err);
      setSubmitError("Ocurrió un error inesperado. Intentá de nuevo.");
    } finally {
      setPublishing(false);
    }
  };

  const handleDraft = () => {
    if (!userId) {
      setDraftNotice(null);
      setDraftError("Iniciá sesión para guardar el borrador en tu cuenta.");
      router.push("/login?next=%2Fvender");
      return;
    }
    void persistDraft({ silent: false, requireAuth: true });
  };

  if (!authReady || !draftLoadDone) {
    return (
      <p className="rounded-2xl border border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-600">
        {authReady
          ? isEditMode
            ? "Cargando publicación…"
            : "Cargando borrador…"
          : "Comprobando sesión…"}
      </p>
    );
  }

  if (isEditMode && !userId) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-6 text-center text-sm text-zinc-600">
        <p>Iniciá sesión para editar tu publicación.</p>
        <Link
          href={`/login?next=${encodeURIComponent(`/vender/editar/${editProductId}`)}`}
          className="mt-3 inline-block font-semibold text-[#822020] hover:underline"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  const totalImages = photos.length + remoteImageUrls.length;

  return (
    <form
      noValidate
      onSubmit={(ev) => void handleSubmit(ev)}
      className="mx-auto w-full max-w-3xl space-y-6 pb-10 sm:space-y-8"
    >
      {!userId ? (
        <div className="rounded-2xl border border-[#822020]/20 bg-[#822020]/[0.06] px-4 py-3 text-sm text-zinc-700 sm:px-5">
          <p>
            Podés completar y guardar un borrador en este dispositivo.{" "}
            <Link href="/login?next=%2Fvender" className="font-semibold text-[#822020] underline-offset-2 hover:underline">
              Iniciá sesión
            </Link>{" "}
            para sincronizar borradores en tu perfil y publicar.
          </p>
        </div>
      ) : isEditMode ? (
        <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-600">
          Editando tu publicación. Los cambios se guardan al confirmar.
        </p>
      ) : draftId ? (
        <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-600">
          Editando borrador guardado. Los cambios se guardan automáticamente.
        </p>
      ) : null}

      {submitError ? (
        <p role="alert" className="rounded-2xl border border-[#822020]/25 bg-[#822020]/10 px-4 py-3 text-sm text-[#6d1b1b]">
          {submitError}
        </p>
      ) : null}

      {draftNotice ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">{draftNotice}</p>
      ) : null}

      {draftError ? (
        <p role="alert" className="rounded-xl border border-[#822020]/25 bg-[#822020]/10 px-4 py-2 text-sm text-[#6d1b1b]">
          {draftError}
        </p>
      ) : null}

      {Object.keys(errors).length > 0 ? (
        <p className="text-sm text-red-600" role="alert">
          Revisá los campos marcados abajo.
        </p>
      ) : null}

      {/* Fotos */}
      <section
        className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-7"
        aria-labelledby={`${formId}-photos`}
      >
        <h2 id={`${formId}-photos`} className="text-lg font-semibold text-zinc-900 sm:text-xl">
          Fotos del producto
        </h2>
        <p className="mt-1 text-sm text-zinc-500 sm:text-base">
          Subí al menos una imagen. Se publicarán en tu listado al confirmar.
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

          {totalImages > 0 && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {remoteImageUrls.map((url) => (
                <li key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeRemoteImage(url)}
                    className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900/75 text-white transition hover:bg-red-600"
                    aria-label="Quitar imagen"
                  >
                    <span className="text-lg leading-none">×</span>
                  </button>
                </li>
              ))}
              {photos.map((p) => (
                <li key={p.id} className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.previewUrl} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(p.id)}
                    className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900/75 text-white transition hover:bg-red-600"
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
        className="space-y-4 rounded-2xl border border-zinc-200/90 bg-white p-5 sm:space-y-5 sm:p-7"
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
              setDraftNotice(null);
            }}
            placeholder="Ej. Mochila con ruedas, talle único"
          />
          {errors.title && <p className={errorTextClass}>{errors.title}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${formId}-desc`} className={labelClass}>
            Descripción <span className="font-normal text-zinc-500">(opcional)</span>
          </label>
          <textarea
            id={`${formId}-desc`}
            rows={5}
            className={`${inputClass} min-h-[120px] resize-y`}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setErrors((x) => ({ ...x, description: undefined }));
              setDraftNotice(null);
            }}
            placeholder="Contá el estado, medidas, marca, etc."
          />
          {errors.description && <p className={errorTextClass}>{errors.description}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${formId}-cat`} className={labelClass}>
            Categoría <span className="font-normal text-zinc-500">(opcional)</span>
          </label>
          <select
            id={`${formId}-cat`}
            className={inputClass}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setErrors((x) => ({ ...x, category: undefined }));
              setDraftNotice(null);
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
                    setDraftNotice(null);
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
                        setDraftNotice(null);
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
                        setDraftNotice(null);
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
                setDraftNotice(null);
              }}
              placeholder="Ej. 45000 o 12.500"
            />
          </div>
          {errors.price && <p className={errorTextClass}>{errors.price}</p>}
        </div>
      </section>

      {/* Detalle y entrega */}
      <section
        className="space-y-4 rounded-2xl border border-zinc-200/90 bg-white p-5 sm:space-y-5 sm:p-7"
        aria-labelledby={`${formId}-extra`}
      >
        <h2 id={`${formId}-extra`} className="text-lg font-semibold text-zinc-900 sm:text-xl">
          Detalle y entrega
        </h2>

        <div className="space-y-1.5">
          <label htmlFor={`${formId}-brand`} className={labelClass}>
            Marca <span className="font-normal text-zinc-500">(opcional)</span>
          </label>
          <input
            id={`${formId}-brand`}
            className={inputClass}
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value);
              setDraftNotice(null);
            }}
            placeholder="Ej. Nike, Adidas, Topper…"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${formId}-inst`} className={labelClass}>
            Institución o colegio <span className="font-normal text-zinc-500">(opcional)</span>
          </label>
          <input
            id={`${formId}-inst`}
            className={inputClass}
            value={institution}
            onChange={(e) => {
              setInstitution(e.target.value);
              setDraftNotice(null);
            }}
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
            onChange={(e) => {
              setSizeLabel(e.target.value);
              setDraftNotice(null);
            }}
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
              setDraftNotice(null);
            }}
            placeholder="Barrio, ciudad o zona (ej. Belgrano, CABA)"
          />
          {errors.location && <p className={errorTextClass}>{errors.location}</p>}
        </div>

        <fieldset>
          <legend className={`${labelClass} mb-2`}>Método de entrega</legend>
          <div className="space-y-2">
            {SELL_DELIVERY_OPTIONS.map(({ value: v, label, sub, recommended }) => (
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
                    setDraftNotice(null);
                    setErrors((x) => ({ ...x, delivery: undefined }));
                  }}
                  className="mt-0.5 h-4 w-4 text-[#822020] focus:ring-[#822020]/30 sm:mt-0"
                />
                <span>
                  <span className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-sm font-medium sm:text-base ${delivery === v ? "text-[#822020]" : "text-zinc-900"}`}
                    >
                      {label}
                    </span>
                    {recommended ? (
                      <span className="rounded-full bg-[#822020] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white sm:text-xs">
                        Recomendado
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-xs text-zinc-500 sm:text-sm">{sub}</span>
                </span>
              </label>
            ))}
          </div>
          {delivery ? (
            <p
              role="status"
              className="mt-3 rounded-xl border border-[#822020]/30 bg-[#822020]/[0.08] px-4 py-3 text-sm leading-relaxed text-[#822020] sm:text-base"
            >
              A pesar de elegir eso, tendrás que coordinar con el comprador.
            </p>
          ) : null}
          {errors.delivery && <p className={`${errorTextClass} mt-2`}>{errors.delivery}</p>}
        </fieldset>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-4">
        {isEditMode ? (
          <Link
            href="/perfil?tab=publicaciones"
            className="order-2 inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 sm:order-1 sm:px-8 sm:text-base"
          >
            Cancelar
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleDraft}
            disabled={savingDraft}
            className="order-2 rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 sm:order-1 sm:px-8 sm:text-base"
          >
            {savingDraft ? "Guardando…" : "Guardar borrador"}
          </button>
        )}
        <button
          type="submit"
          disabled={publishing}
          className="order-1 rounded-full bg-[#822020] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#6d1b1b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020] disabled:cursor-not-allowed disabled:opacity-60 sm:order-2 sm:px-10 sm:text-base"
        >
          {publishing
            ? isEditMode
              ? "Guardando…"
              : "Publicando…"
            : isEditMode
              ? "Guardar cambios"
              : userId
                ? "Publicar producto"
                : "Iniciar sesión para publicar"}
        </button>
      </div>
    </form>
  );
}
