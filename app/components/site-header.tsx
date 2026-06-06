import Link from "next/link";
import { Suspense } from "react";
import { CategoryMegaMenu } from "@/app/components/category-mega-menu";
import { ProductSearchForm } from "@/app/components/product-search-form";
import { NotificationsBell } from "@/app/components/notifications-bell";
import { SiteHeaderAuthLink } from "@/app/components/site-header-auth-link";

export function SiteHeader() {
  return (
    <header className="relative z-30 border-b border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-2 px-4 pt-4 pb-0 max-lg:gap-2 max-lg:pt-3 lg:px-6">
        <div className="grid max-lg:grid-cols-[minmax(0,1fr)_auto] max-lg:grid-rows-[auto_auto] max-lg:items-center max-lg:gap-x-2 max-lg:gap-y-2.5 lg:flex lg:flex-wrap lg:items-center lg:gap-6">
          <Link
            href="/"
            className="max-lg:col-start-1 max-lg:row-start-1 text-3xl font-bold italic leading-none text-[#8E1B22] lg:text-4xl"
            aria-label="Colex"
          >
            colex
          </Link>

          <Suspense
            fallback={
              <div className="max-lg:col-span-2 max-lg:row-start-2 max-lg:h-10 max-lg:animate-pulse max-lg:rounded-xl max-lg:bg-zinc-100 lg:min-w-0 lg:flex-1" />
            }
          >
            <ProductSearchForm
              id="colex-header-search"
              placeholder="Busca un artículo"
              className="max-lg:col-span-2 max-lg:row-start-2 max-lg:min-w-0 max-lg:w-full lg:min-w-0 lg:flex-1"
              inputClassName="h-10 w-full min-w-0 rounded-xl border border-zinc-300 px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-[#822020]/10 lg:h-12 lg:px-4"
            />
          </Suspense>

          <div className="ml-auto flex items-center gap-0.5 text-zinc-900 max-lg:col-start-2 max-lg:row-start-1 max-lg:shrink-0 lg:gap-3">
            <SiteHeaderAuthLink />
            <NotificationsBell />
            <Link
              href="/mensajes"
              aria-label="Mensajes"
              className="max-lg:hidden p-1.5 text-zinc-800 transition hover:text-[#822020] lg:inline-flex lg:p-2"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-6 w-6 lg:h-8 lg:w-8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4.5C7.86 4.5 4.5 7.62 4.5 11.47C4.5 13.42 5.37 15.19 6.78 16.46C6.66 17.72 6.08 18.88 5.14 19.75C6.92 19.64 8.61 18.98 9.92 17.88C10.59 18.08 11.28 18.18 12 18.18C16.14 18.18 19.5 15.06 19.5 11.21C19.5 7.62 16.14 4.5 12 4.5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link
              href="/favoritos"
              aria-label="Favoritos"
              className="p-1.5 text-zinc-800 transition hover:text-[#822020] lg:p-2"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-7 w-7 lg:h-[34px] lg:w-[34px]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 20.25C11.72 20.25 11.45 20.15 11.24 19.96L5.46 14.61C3.98 13.24 3.6 10.99 4.56 9.19C5.29 7.83 6.67 6.96 8.19 6.96C9.28 6.96 10.34 7.42 11.12 8.24L12 9.15L12.88 8.24C13.66 7.42 14.72 6.96 15.81 6.96C17.33 6.96 18.71 7.83 19.44 9.19C20.4 10.99 20.02 13.24 18.54 14.61L12.76 19.96C12.55 20.15 12.28 20.25 12 20.25Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link href="/ajustes" aria-label="Ajustes" className="p-1.5 md:-ml-1 lg:p-2">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-7 w-7 lg:h-[30px] lg:w-[30px]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19.14 12.94C19.18 12.63 19.2 12.31 19.2 12C19.2 11.69 19.18 11.37 19.14 11.06L21.07 9.55C21.24 9.42 21.29 9.18 21.19 8.99L19.36 5.81C19.26 5.62 19.03 5.54 18.83 5.61L16.56 6.53C16.06 6.14 15.51 5.82 14.9 5.58L14.56 3.16C14.53 2.95 14.35 2.8 14.14 2.8H10.48C10.27 2.8 10.09 2.95 10.06 3.16L9.72 5.58C9.11 5.82 8.56 6.14 8.06 6.53L5.79 5.61C5.59 5.54 5.36 5.62 5.26 5.81L3.43 8.99C3.33 9.18 3.38 9.42 3.55 9.55L5.48 11.06C5.44 11.37 5.42 11.69 5.42 12C5.42 12.31 5.44 12.63 5.48 12.94L3.55 14.45C3.38 14.58 3.33 14.82 3.43 15.01L5.26 18.19C5.36 18.38 5.59 18.46 5.79 18.39L8.06 17.47C8.56 17.86 9.11 18.18 9.72 18.42L10.06 20.84C10.09 21.05 10.27 21.2 10.48 21.2H14.14C14.35 21.2 14.53 21.05 14.56 20.84L14.9 18.42C15.51 18.18 16.06 17.86 16.56 17.47L18.83 18.39C19.03 18.46 19.26 18.38 19.36 18.19L21.19 15.01C21.29 14.82 21.24 14.58 21.07 14.45L19.14 12.94Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.31 15.5C14.243 15.5 15.81 13.933 15.81 12C15.81 10.067 14.243 8.5 12.31 8.5C10.377 8.5 8.81 10.067 8.81 12C8.81 13.933 10.377 15.5 12.31 15.5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link
              href="/vender"
              className="hidden rounded-full bg-[#822020] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[#6d1b1b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020] lg:inline-flex"
            >
              Vender
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center border-t border-zinc-100 py-2 max-lg:py-1.5">
          <Suspense fallback={null}>
            <CategoryMegaMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
