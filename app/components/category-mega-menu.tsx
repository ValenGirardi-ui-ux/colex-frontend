"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  MEGA_MENU_CATEGORIES,
  getMegaMenuCategory,
  getMainFilterLabel,
  getSubFilterLabel,
  isMainFilterId,
  type MainFilterId,
} from "@/src/data/product-filters";
import {
  buildBrowseHref,
  parseCatalogFilterParams,
  type BrowseBasePath,
} from "@/src/lib/product-filters";

function browseBase(pathname: string): BrowseBasePath {
  return pathname.startsWith("/buscar") ? "buscar" : "home";
}

type CategoryMegaMenuProps = {
  onNavigate?: () => void;
};

export function CategoryMegaMenu({ onNavigate }: CategoryMegaMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const base = browseBase(pathname);
  const urlFilters = parseCatalogFilterParams({
    main: searchParams.get("cat"),
    sub: searchParams.get("sub"),
    query: searchParams.get("q"),
  });
  const currentQuery = urlFilters.query;

  const [openMain, setOpenMain] = useState<MainFilterId | null>(null);
  const [canHover, setCanHover] = useState(false);

  const activeCategory = openMain ? getMegaMenuCategory(openMain) : null;
  const panelOpen =
    openMain != null && openMain !== "todo" && (activeCategory?.subs.length ?? 0) > 0;

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setCanHover(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const close = useCallback(() => {
    setOpenMain(null);
  }, []);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = useCallback(() => {
    if (!canHover) return;
    clearCloseTimer();
    closeTimer.current = setTimeout(() => close(), 120);
  }, [canHover, close]);

  const navigateTo = useCallback(
    (main: MainFilterId, sub: string = "todo") => {
      const href = buildBrowseHref(base, {
        main,
        sub,
        query: currentQuery,
      });
      close();
      onNavigate?.();
      router.push(href);
    },
    [base, close, currentQuery, onNavigate, router],
  );

  useEffect(() => {
    close();
  }, [pathname, searchParams, close]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    if (!panelOpen) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (target && rootRef.current && !rootRef.current.contains(target)) {
        close();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [panelOpen, close]);

  const selectMainCategory = (main: MainFilterId) => {
    clearCloseTimer();
    if (main === "todo") {
      navigateTo("todo", "todo");
      return;
    }
    const category = getMegaMenuCategory(main);
    const hasSubs = (category?.subs.length ?? 0) > 0;
    if (!canHover && hasSubs) {
      setOpenMain((prev) => (prev === main ? null : main));
      return;
    }
    navigateTo(main, "todo");
  };

  const isTodoActive = urlFilters.main === "todo" && urlFilters.sub === "todo";
  const isMainActive = (id: MainFilterId) =>
    id === "todo" ? isTodoActive : urlFilters.main === id;
  const isSubActive = (main: MainFilterId, subId: string) =>
    urlFilters.main === main && urlFilters.sub === subId;

  const subGridClass =
    (activeCategory?.subs.length ?? 0) > 4
      ? "grid grid-cols-2 gap-x-4 gap-y-0.5"
      : "flex flex-col gap-0.5";

  return (
    <div
      ref={rootRef}
      className="relative -mx-4 w-full min-w-0 px-4 sm:-mx-6 sm:px-6 lg:-mx-6"
      onMouseLeave={scheduleClose}
    >
      {!canHover && panelOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          aria-label="Cerrar subcategorías"
          onClick={close}
        />
      ) : null}
      <nav
        className="flex min-h-[1.25rem] max-lg:snap-x max-lg:snap-mandatory items-center justify-start gap-x-4 overflow-x-auto overflow-y-visible text-sm leading-none text-zinc-600 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] max-lg:px-0.5 lg:justify-center lg:gap-x-7"
        aria-label="Categorías"
      >
        {MEGA_MENU_CATEGORIES.map(({ id, label }) => {
          const isOpen = openMain === id;
          const isTodo = id === "todo";
          const isActive = isMainActive(id);

          if (isTodo) {
            return (
              <Link
                key={id}
                href={buildBrowseHref(base, { main: "todo", sub: "todo", query: currentQuery })}
                className={`inline-flex max-lg:snap-start shrink-0 items-center whitespace-nowrap transition hover:text-[#822020] ${
                  isTodoActive ? "font-medium text-[#822020]" : ""
                }`}
                onClick={() => close()}
              >
                {label}
              </Link>
            );
          }

          return (
            <div key={id} className="relative shrink-0">
              <button
                type="button"
                className={`inline-flex items-center whitespace-nowrap transition hover:text-[#822020] ${
                  isActive || isOpen ? "font-medium text-[#822020]" : ""
                } ${isActive ? "underline decoration-[#822020] decoration-2 underline-offset-4" : ""}`}
                aria-expanded={isOpen}
                aria-controls={isOpen && panelOpen ? panelId : undefined}
                onMouseEnter={() => {
                  if (canHover) {
                    clearCloseTimer();
                    setOpenMain(id);
                  }
                }}
                onClick={() => selectMainCategory(id)}
              >
                {label}
              </button>

              {isOpen && panelOpen && activeCategory?.id === id ? (
                <div
                  id={panelId}
                  role="region"
                  aria-label={`Subcategorías de ${activeCategory.label}`}
                  className="absolute left-0 top-full z-50 mt-1 w-max min-w-[11rem] max-w-[min(calc(100vw-2rem),20rem)] rounded-md border border-zinc-200 bg-white py-2 pl-3 pr-2 max-lg:fixed max-lg:inset-x-3 max-lg:top-auto max-lg:bottom-[calc(3.25rem+env(safe-area-inset-bottom))] max-lg:mt-0 max-lg:w-auto max-lg:max-w-none max-lg:translate-x-0 max-lg:rounded-xl max-lg:shadow-lg sm:left-1/2 sm:-translate-x-1/2"
                  onMouseEnter={clearCloseTimer}
                >
                  <div className="mb-1.5 flex items-center justify-between gap-3 border-b border-zinc-100 pb-1.5 pr-1">
                    <span className="text-xs font-medium text-zinc-500">{activeCategory.label}</span>
                    <button
                      type="button"
                      className="text-xs font-medium text-[#822020] hover:underline"
                      onClick={() => navigateTo(activeCategory.id, "todo")}
                    >
                      Ver todo
                    </button>
                  </div>
                  <ul className={subGridClass}>
                    {activeCategory.subs.map((sub) => {
                      const subActive = isSubActive(activeCategory.id, sub.id);
                      return (
                        <li key={sub.id}>
                          <button
                            type="button"
                            className={`block w-full rounded px-1 py-1 text-left text-sm transition hover:text-[#822020] ${
                              subActive
                                ? "font-medium text-[#822020]"
                                : "text-zinc-700"
                            }`}
                            onClick={() => navigateTo(activeCategory.id, sub.id)}
                          >
                            {sub.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

export function activeFilterLabel(main: string, sub: string): string | null {
  if (!isMainFilterId(main) || (main === "todo" && (!sub || sub === "todo"))) return null;
  const m = main as MainFilterId;
  if (!sub || sub === "todo") return getMainFilterLabel(m);
  return `${getMainFilterLabel(m)} · ${getSubFilterLabel(m, sub)}`;
}
