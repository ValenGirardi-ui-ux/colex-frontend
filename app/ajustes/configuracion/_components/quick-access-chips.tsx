"use client";

type QuickAccessChipsProps = {
  items: string[];
  onSelect: (value: string) => void;
};

export function QuickAccessChips({ items, onSelect }: QuickAccessChipsProps) {
  return (
    <section aria-label="Accesos rápidos" className="space-y-3">
      <h3 className="text-sm font-semibold text-zinc-700">Accesos rápidos</h3>
      <div className="flex flex-wrap gap-2.5">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 shadow-sm transition hover:border-[#0A8FA1]/50 hover:text-[#0A8FA1] active:scale-[0.98]"
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}
