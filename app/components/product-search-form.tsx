"use client";

import { usePathname, useRouter } from "next/navigation";
import { type FormEvent, type ReactNode } from "react";
import {
  buildBrowseHref,
  parseCatalogFilterParams,
  type BrowseBasePath,
} from "@/src/lib/product-filters";

type ProductSearchFormProps = {
  id: string;
  placeholder: string;
  defaultQuery?: string;
  inputClassName: string;
  className?: string;
  hint?: ReactNode;
};

function resolveBase(pathname: string): BrowseBasePath {
  return pathname.startsWith("/buscar") ? "buscar" : "home";
}

export function ProductSearchForm({
  id,
  placeholder,
  defaultQuery = "",
  inputClassName,
  className,
  hint,
}: ProductSearchFormProps) {
  const router = useRouter();
  const pathname = usePathname();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const q = String(formData.get("q") ?? "").trim();

    const current =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();
    const { main, sub } = parseCatalogFilterParams({
      main: current.get("cat"),
      sub: current.get("sub"),
      query: q,
    });

    const base = resolveBase(pathname);
    const href = buildBrowseHref(base, { main, sub, query: q });

    if (!q && main === "todo" && sub === "todo") {
      if (base === "home") router.push("/#productos-destacados");
      return;
    }

    router.push(href);
  }

  return (
    <form onSubmit={onSubmit} role="search" className={className}>
      <label htmlFor={id} className="block w-full">
        <span className="sr-only">{placeholder}</span>
        <input
          id={id}
          name="q"
          type="search"
          inputMode="search"
          autoComplete="off"
          defaultValue={defaultQuery}
          placeholder={placeholder}
          className={inputClassName}
        />
      </label>
      {hint}
    </form>
  );
}
