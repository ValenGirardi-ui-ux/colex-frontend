"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
  match: (path: string) => boolean;
  icon: ReactNode;
  fab?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Inicio",
    match: (path: string) => path === "/",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 10.5L12 4l8 6.5V19a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-8.5z" />
      </svg>
    ),
  },
  {
    href: "/buscar",
    label: "Buscar",
    match: (path: string) => path.startsWith("/buscar"),
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <circle cx="11" cy="11" r="6.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 16.5L20 20" />
      </svg>
    ),
  },
  {
    href: "/vender",
    label: "Vender",
    fab: true,
    match: (path: string) => path.startsWith("/vender"),
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    href: "/mensajes",
    label: "Chat",
    match: (path: string) => path.startsWith("/mensajes"),
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4.5C7.86 4.5 4.5 7.62 4.5 11.47c0 1.95.87 3.72 2.28 4.99-.12 1.26-.7 2.42-1.64 3.29 1.78-.11 3.47-.77 4.78-1.87.67.2 1.36.3 2.08.3 4.14 0 7.5-3.12 7.5-6.97C19.5 7.62 16.14 4.5 12 4.5z"
        />
      </svg>
    ),
  },
  {
    href: "/perfil",
    label: "Perfil",
    match: (path: string) => path.startsWith("/perfil"),
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <circle cx="12" cy="9" r="3.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 19.25c.94-2.49 3.08-4.25 5.5-4.25s4.56 1.76 5.5 4.25" />
      </svg>
    ),
  },
];

const HIDDEN_PREFIXES = ["/login", "/registro"];

export function MobileBottomNav() {
  const pathname = usePathname();

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) {
    return null;
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      aria-label="Navegación principal"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5 items-end">
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname);

          if (item.fab) {
            return (
              <li key={item.href} className="flex justify-center">
                <Link
                  href={item.href}
                  className="group relative -mt-4 flex flex-col items-center gap-1 pb-1.5"
                  aria-current={active ? "page" : undefined}
                  aria-label={item.label}
                >
                  <span
                    className={`flex h-[3.15rem] w-[3.15rem] items-center justify-center rounded-full bg-[#822020] text-white shadow-[0_4px_12px_rgba(130,32,32,0.42)] ring-4 ring-white transition group-hover:bg-[#6d1b1b] group-active:scale-95 ${
                      active ? "ring-[#822020]/15" : ""
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${active ? "text-[#822020]" : "text-zinc-600"}`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          }

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10px] font-medium transition ${
                  active ? "text-[#822020]" : "text-zinc-500"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
