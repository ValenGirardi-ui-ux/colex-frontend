"use client";

type StarRatingDisplayProps = {
  value: number;
  max?: number;
  size?: "sm" | "md";
  showValue?: boolean;
  className?: string;
};

function starSizeClass(size: "sm" | "md"): string {
  return size === "sm" ? "h-3.5 w-3.5 sm:h-4 sm:w-4" : "h-4 w-4 sm:h-5 sm:w-5";
}

function StarPath({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="h-full w-full" aria-hidden>
      <path
        fill={filled ? "currentColor" : "#d4d4d8"}
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
      />
    </svg>
  );
}

export function StarRatingDisplay({
  value,
  max = 5,
  size = "md",
  showValue = false,
  className = "",
}: StarRatingDisplayProps) {
  const clamped = Math.max(0, Math.min(max, value));
  const filledCount = Math.round(clamped);
  const sizeClass = starSizeClass(size);

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="inline-flex text-amber-500" role="img" aria-label={`${clamped} de ${max} estrellas`}>
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={sizeClass}>
            <StarPath filled={i < filledCount} />
          </span>
        ))}
      </span>
      {showValue ? (
        <span className="text-sm font-semibold tabular-nums text-zinc-800">{clamped.toFixed(1)}</span>
      ) : null}
    </span>
  );
}

type StarRatingInputProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
};

export function StarRatingInput({ value, onChange, disabled = false, label = "Calificación" }: StarRatingInputProps) {
  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="text-sm font-medium text-zinc-800">{label}</legend>
      <div className="flex gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((star) => {
          const selected = value >= star;
          return (
            <button
              key={star}
              type="button"
              disabled={disabled}
              onClick={() => onChange(star)}
              className={`rounded-md p-1 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#822020] disabled:opacity-50 ${
                selected ? "text-amber-500" : "text-zinc-300 hover:text-amber-400"
              }`}
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} estrella${star > 1 ? "s" : ""}`}
            >
              <span className="block h-8 w-8 sm:h-9 sm:w-9">
                <StarPath filled={selected} />
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
