"use client";

import { useState } from "react";
import type { HelpFaq } from "./help-center-types";

type FAQAccordionProps = {
  items: HelpFaq[];
};

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <article key={item.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <button
              type="button"
              onClick={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-zinc-50"
            >
              <span className="text-sm font-medium text-zinc-900 sm:text-base">{item.question}</span>
              <span
                aria-hidden
                className={`text-lg text-zinc-500 transition-transform ${isOpen ? "rotate-45" : ""}`}
              >
                +
              </span>
            </button>

            <div
              className={`grid transition-all duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] border-t border-zinc-100" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-4 py-3 text-sm leading-relaxed text-zinc-600">{item.answer}</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
