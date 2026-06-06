/** Día del mes de aniversario (1–31) respetando meses cortos (ej. 31 → 30/28). */
export function clampAnniversaryDay(day: number, year: number, monthIndex: number): number {
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  return Math.min(Math.max(1, day), lastDay);
}

/**
 * Próxima fecha de fin de período en el mismo día del mes que `anchor`, estrictamente después de `after`.
 * Ej.: anchor 27/7, after 27/7 → 27/8; after 27/8 → 27/9.
 */
export function nextPremiumPeriodEnd(anchor: Date, after: Date): Date {
  const anniversaryDay = anchor.getUTCDate();
  let year = after.getUTCFullYear();
  let month = after.getUTCMonth();

  const candidate = (y: number, m: number) =>
    new Date(Date.UTC(y, m, clampAnniversaryDay(anniversaryDay, y, m), 23, 59, 59, 999));

  let end = candidate(year, month);
  if (end.getTime() <= after.getTime()) {
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
    end = candidate(year, month);
  }
  return end;
}

/** Primer fin de período al activar (un mes después del alta, mismo día). */
export function initialPremiumPeriodEnd(startedAt: Date): Date {
  return nextPremiumPeriodEnd(startedAt, startedAt);
}

export function formatPremiumDateEs(iso: string | null | undefined): string | null {
  if (!iso?.trim()) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: "America/Argentina/Cordoba",
  }).format(d);
}
