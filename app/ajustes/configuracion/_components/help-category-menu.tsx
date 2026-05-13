"use client";

import type { HelpCategory } from "./help-center-types";

type HelpCategoryMenuProps = {
  categories: HelpCategory[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
};

export function HelpCategoryMenu({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: HelpCategoryMenuProps) {
  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {categories.map((category) => {
          const active = category.id === selectedCategoryId;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition active:scale-[0.98] ${
                active
                  ? "border-[#0A8FA1] bg-[#E8F5F7] text-[#0A8FA1]"
                  : "border-zinc-200 bg-white text-zinc-700"
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900">Categorías</h3>
          <div className="space-y-2">
            {categories.map((category) => {
              const active = category.id === selectedCategoryId;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => onSelectCategory(category.id)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-[#0A8FA1] bg-[#E8F5F7]"
                      : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-lg" aria-hidden>
                      {category.icon}
                    </span>
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          active ? "text-[#0A8FA1]" : "text-zinc-900"
                        }`}
                      >
                        {category.name}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
