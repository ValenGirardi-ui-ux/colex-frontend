"use client";

export const adminInputClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-[#822020] focus:ring-2 focus:ring-[#822020]/20";

export function formatAdminDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

export function AdminFeedback({
  feedback,
}: {
  feedback: { type: "ok" | "err"; text: string } | null;
}) {
  if (!feedback) return null;
  return (
    <p
      className={`rounded-xl px-4 py-3 text-sm ${
        feedback.type === "ok"
          ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border border-red-200 bg-red-50 text-red-900"
      }`}
      role="status"
    >
      {feedback.text}
    </p>
  );
}

export function AdminToggle({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
        checked ? "bg-[#822020]" : "bg-zinc-200"
      } ${disabled ? "cursor-wait opacity-60" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export function adminStatusLabel(status: string): string {
  switch (status) {
    case "active":
      return "Publicada";
    case "paused":
      return "Pausada";
    case "sold":
      return "Vendida";
    case "draft":
      return "Borrador";
    default:
      return status;
  }
}

export function adminStatusBadgeClass(status: string): string {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-900 ring-emerald-200/80";
    case "paused":
      return "bg-amber-50 text-amber-900 ring-amber-200/80";
    case "sold":
      return "bg-zinc-100 text-zinc-700 ring-zinc-200/80";
    default:
      return "bg-zinc-100 text-zinc-700 ring-zinc-200/80";
  }
}
