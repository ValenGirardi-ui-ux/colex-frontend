"use client";

import { useFavorites } from "@/src/context/favorites-context";

type FavoriteToggleButtonProps = {
  productId: string;
  /** Estilo del botón flotante en cards. */
  variant?: "card" | "detail";
  className?: string;
};

export function FavoriteToggleButton({ productId, variant = "card", className }: FavoriteToggleButtonProps) {
  const { ready, isFavorite, toggleFavorite, lastMessage, clearMessage } = useFavorites();
  const fav = isFavorite(productId);
  const compact = variant === "card";

  const cardClass = `absolute z-20 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-sm transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#822020] right-2 top-2 h-9 w-9 sm:h-10 sm:w-10 ${
    fav ? "text-[#822020]" : "text-zinc-500 hover:text-[#822020]"
  }`;

  const detailClass =
    "flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-zinc-300 bg-white text-sm font-semibold text-zinc-800 transition hover:border-[#822020]/40 hover:text-[#822020] sm:h-14 sm:text-base";

  const button = (
    <button
      type="button"
      disabled={!ready}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        clearMessage();
        void toggleFavorite(productId);
      }}
      aria-pressed={fav}
      aria-label={fav ? "Quitar de favoritos" : "Agregar a favoritos"}
      className={className ?? (variant === "card" ? cardClass : detailClass)}
    >
      {variant === "detail" ? (
        <>
          {fav ? (
            <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg
              className="h-6 w-6 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden
            >
              <path
                d="M12 20.25C11.72 20.25 11.45 20.15 11.24 19.96L5.46 14.61C3.98 13.24 3.6 10.99 4.56 9.19C5.29 7.83 6.67 6.96 8.19 6.96C9.28 6.96 10.34 7.42 11.12 8.24L12 9.15L12.88 8.24C13.66 7.42 14.72 6.96 15.81 6.96C17.33 6.96 18.71 7.83 19.44 9.19C20.4 10.99 20.02 13.24 18.54 14.61L12.76 19.96C12.55 20.15 12.28 20.25 12 20.25Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {fav ? "Guardado en favoritos" : "Guardar en favoritos"}
        </>
      ) : fav ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" aria-hidden>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 sm:h-6 sm:w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          aria-hidden
        >
          <path
            d="M12 20.25C11.72 20.25 11.45 20.15 11.24 19.96L5.46 14.61C3.98 13.24 3.6 10.99 4.56 9.19C5.29 7.83 6.67 6.96 8.19 6.96C9.28 6.96 10.34 7.42 11.12 8.24L12 9.15L12.88 8.24C13.66 7.42 14.72 6.96 15.81 6.96C17.33 6.96 18.71 7.83 19.44 9.19C20.4 10.99 20.02 13.24 18.54 14.61L12.76 19.96C12.55 20.15 12.28 20.25 12 20.25Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );

  if (variant === "detail") {
    return (
      <div className="space-y-2">
        {button}
        {lastMessage ? (
          <p role="alert" className="rounded-xl border border-[#822020]/25 bg-[#822020]/10 px-3 py-2 text-sm text-[#6d1b1b]">
            {lastMessage}
          </p>
        ) : null}
      </div>
    );
  }

  return button;
}
