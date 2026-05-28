/** Envío Colex a domicilio: solo provincia de Córdoba, hasta 100 km desde Córdoba Capital. */

export const CORDOBA_SHIPPING_DISCLAIMER =
  "Envíos disponibles solo dentro de Córdoba y hasta 100 km de Córdoba Capital.";

/** Máxima distancia permitida desde Córdoba Capital (km). */
export const MAX_CORDOBA_SHIPPING_KM = 100;

export const SHIPPING_FEE_CORDOBA_CAPITAL = 4500;
/** Fuera de Capital pero dentro de 100 km desde Córdoba Capital. */
export const SHIPPING_FEE_WITHIN_100_KM = 9000;

/** @deprecated usar MAX_CORDOBA_SHIPPING_KM */
export const SHIPPING_NEAR_KM = MAX_CORDOBA_SHIPPING_KM;

/** @deprecated ya no aplica tarifa entre 100 y 300 km */
export const SHIPPING_FEE_UP_TO_100_KM = SHIPPING_FEE_WITHIN_100_KM;

/** @deprecated envío no disponible más allá de 100 km */
export const SHIPPING_FEE_100_TO_300_KM = SHIPPING_FEE_WITHIN_100_KM;

export type GeoPoint = { lat: number; lng: number };

export type CordobaLocality = {
  id: string;
  label: string;
  isCapital: boolean;
  lat: number;
  lng: number;
};

/** Localidades de Córdoba con coordenadas aproximadas para validar distancia. */
export const CORDOBA_LOCALITIES: readonly CordobaLocality[] = [
  { id: "cordoba-capital", label: "Córdoba Capital", isCapital: true, lat: -31.4201, lng: -64.1888 },
  { id: "villa-carlos-paz", label: "Villa Carlos Paz", isCapital: false, lat: -31.4241, lng: -64.4978 },
  { id: "alta-gracia", label: "Alta Gracia", isCapital: false, lat: -31.4297, lng: -64.4288 },
  { id: "rio-cuarto", label: "Río Cuarto", isCapital: false, lat: -33.123, lng: -64.3491 },
  { id: "villa-maria", label: "Villa María", isCapital: false, lat: -32.4075, lng: -63.2402 },
  { id: "san-francisco", label: "San Francisco", isCapital: false, lat: -31.4277, lng: -62.0827 },
  { id: "rio-tercero", label: "Río Tercero", isCapital: false, lat: -32.173, lng: -64.1141 },
  { id: "bell-ville", label: "Bell Ville", isCapital: false, lat: -32.6259, lng: -62.6887 },
  { id: "marcos-juarez", label: "Marcos Juárez", isCapital: false, lat: -32.6972, lng: -62.1067 },
  { id: "la-falda", label: "La Falda", isCapital: false, lat: -31.0884, lng: -64.4899 },
  { id: "jesus-maria", label: "Jesús María", isCapital: false, lat: -30.9815, lng: -64.0942 },
  { id: "cosquin", label: "Cosquín", isCapital: false, lat: -31.2451, lng: -64.4657 },
  { id: "dean-funes", label: "Deán Funes", isCapital: false, lat: -30.4203, lng: -64.3494 },
  { id: "villa-dolores", label: "Villa Dolores", isCapital: false, lat: -31.9458, lng: -65.1896 },
] as const;

const CORDOBA_CAPITAL_COORDS: GeoPoint = { lat: -31.4201, lng: -64.1888 };

const NON_CORDOBA_PROVINCE_PATTERNS: RegExp[] = [
  /\bbuenos\s+aires\b/i,
  /\bcaba\b/i,
  /\bcapital\s+federal\b/i,
  /\bamba\b/i,
  /\bsanta\s+fe\b/i,
  /\brosario\b/i,
  /\bmendoza\b/i,
  /\btucuman\b/i,
  /\bsalta\b/i,
  /\bentre\s+rios\b/i,
  /\bneuquen\b/i,
  /\bchaco\b/i,
  /\bmisiones\b/i,
  /\bcorrientes\b/i,
  /\bformosa\b/i,
  /\bsan\s+juan\b/i,
  /\bsan\s+luis\b/i,
  /\bla\s+pampa\b/i,
  /\brio\s+negro\b/i,
  /\bchubut\b/i,
  /\bsanta\s+cruz\b/i,
  /\btierra\s+del\s+fuego\b/i,
  /\bjujuy\b/i,
  /\bcatamarca\b/i,
  /\bla\s+rioja\b/i,
];

const CORDOBA_PATTERNS: RegExp[] = [
  /\bcordoba\b/i,
  /\bcórdoba\b/i,
  /\bcba\b/i,
  /\bcapital\s+cordoba\b/i,
];

function normalizeText(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function distanceKmFromCordobaCapital(point: GeoPoint): number {
  return Math.round(haversineKm(CORDOBA_CAPITAL_COORDS, point));
}

export function getCordobaLocalityById(id: string | null | undefined): CordobaLocality | null {
  if (!id) return null;
  return CORDOBA_LOCALITIES.find((l) => l.id === id) ?? null;
}

function matchLocalityInText(text: string): CordobaLocality | null {
  const n = normalizeText(text);
  if (!n) return null;
  for (const locality of CORDOBA_LOCALITIES) {
    const key = normalizeText(locality.label);
    if (n.includes(key)) return locality;
  }
  if (/\bcapital\b/.test(n) && (n.includes("cordoba") || n.includes("cba"))) {
    return getCordobaLocalityById("cordoba-capital");
  }
  if (n === "capital" || n === "cordoba capital" || n === "cba capital") {
    return getCordobaLocalityById("cordoba-capital");
  }
  return null;
}

export function isNonCordobaProvinceText(text: string | null | undefined): boolean {
  const n = normalizeText(text);
  if (!n) return false;
  return NON_CORDOBA_PROVINCE_PATTERNS.some((re) => re.test(n));
}

export function isCordobaProvinceText(text: string | null | undefined): boolean {
  const n = normalizeText(text);
  if (!n) return false;
  if (isNonCordobaProvinceText(n)) return false;
  return CORDOBA_PATTERNS.some((re) => re.test(n)) || matchLocalityInText(n) != null;
}

/** Resuelve localidad de Córdoba a partir de campos de dirección guardada. */
export function resolveLocalityFromAddress(parts: {
  line1?: string | null;
  city?: string | null;
  region?: string | null;
}): CordobaLocality | null {
  const combined = [parts.line1, parts.city, parts.region].filter(Boolean).join(" ");
  if (isNonCordobaProvinceText(parts.region) || isNonCordobaProvinceText(combined)) {
    return null;
  }
  return (
    matchLocalityInText(combined) ??
    matchLocalityInText(parts.city ?? "") ??
    matchLocalityInText(parts.region ?? "") ??
    (isCordobaProvinceText(parts.region) && normalizeText(parts.city) === "capital"
      ? getCordobaLocalityById("cordoba-capital")
      : null)
  );
}

export type SellerOriginInfo = {
  coords: GeoPoint;
  label: string;
  estimated: boolean;
  outsideCordoba: boolean;
};

/** Origen del envío según ubicación del producto (con fallback a Capital). */
export function inferSellerOrigin(locationText: string | null | undefined): SellerOriginInfo {
  const raw = (locationText ?? "").trim();
  if (!raw) {
    return {
      coords: CORDOBA_CAPITAL_COORDS,
      label: "Córdoba Capital (ubicación del vendedor no indicada)",
      estimated: true,
      outsideCordoba: false,
    };
  }

  if (isNonCordobaProvinceText(raw)) {
    return {
      coords: CORDOBA_CAPITAL_COORDS,
      label: raw,
      estimated: true,
      outsideCordoba: true,
    };
  }

  const matched = matchLocalityInText(raw);
  if (matched) {
    return {
      coords: { lat: matched.lat, lng: matched.lng },
      label: matched.label,
      estimated: false,
      outsideCordoba: false,
    };
  }

  if (isCordobaProvinceText(raw)) {
    return {
      coords: CORDOBA_CAPITAL_COORDS,
      label: `${raw} (zona Córdoba)`,
      estimated: true,
      outsideCordoba: false,
    };
  }

  return {
    coords: CORDOBA_CAPITAL_COORDS,
    label: `${raw} (referencia: Córdoba Capital)`,
    estimated: true,
    outsideCordoba: false,
  };
}

/**
 * Tarifa según destino y distancia desde Córdoba Capital.
 * - Capital: $4.500
 * - Otra localidad ≤ 100 km desde Capital: $9.000
 * - > 100 km: no permitido (null)
 */
export function shippingFeeFromDistance(
  buyer: CordobaLocality,
  distanceKmFromCapital: number,
): number | null {
  if (distanceKmFromCapital > MAX_CORDOBA_SHIPPING_KM) return null;
  if (buyer.isCapital) return SHIPPING_FEE_CORDOBA_CAPITAL;
  return SHIPPING_FEE_WITHIN_100_KM;
}

export function describeShippingFeeTier(buyer: CordobaLocality, distanceKmFromCapital: number): string {
  if (buyer.isCapital) return "Córdoba Capital";
  if (distanceKmFromCapital <= MAX_CORDOBA_SHIPPING_KM) {
    return `Hasta ${MAX_CORDOBA_SHIPPING_KM} km de Córdoba Capital`;
  }
  return `Más de ${MAX_CORDOBA_SHIPPING_KM} km (no disponible)`;
}

export type HomeDeliveryValidation = {
  valid: boolean;
  shippingFee: number;
  distanceKm: number | null;
  buyerLocationLabel: string;
  sellerOriginLabel: string;
  sellerLocationEstimated: boolean;
  error: string | null;
};

export function validateHomeDelivery(params: {
  sellerLocation: string | null | undefined;
  buyerLocalityId: string | null | undefined;
}): HomeDeliveryValidation {
  const buyer = getCordobaLocalityById(params.buyerLocalityId);
  const seller = inferSellerOrigin(params.sellerLocation);

  if (!buyer) {
    return {
      valid: false,
      shippingFee: 0,
      distanceKm: null,
      buyerLocationLabel: "",
      sellerOriginLabel: seller.label,
      sellerLocationEstimated: seller.estimated,
      error: "Seleccioná tu localidad en Córdoba para calcular el envío a domicilio.",
    };
  }

  if (seller.outsideCordoba) {
    return {
      valid: false,
      shippingFee: 0,
      distanceKm: null,
      buyerLocationLabel: buyer.label,
      sellerOriginLabel: seller.label,
      sellerLocationEstimated: seller.estimated,
      error:
        "El vendedor publicó desde otra provincia. El envío Colex a domicilio solo aplica dentro de Córdoba.",
    };
  }

  const distanceKm = distanceKmFromCordobaCapital({ lat: buyer.lat, lng: buyer.lng });

  if (distanceKm > MAX_CORDOBA_SHIPPING_KM) {
    return {
      valid: false,
      shippingFee: 0,
      distanceKm,
      buyerLocationLabel: buyer.label,
      sellerOriginLabel: seller.label,
      sellerLocationEstimated: seller.estimated,
      error: `La dirección está a ${distanceKm} km de Córdoba Capital. El envío a domicilio solo está disponible hasta ${MAX_CORDOBA_SHIPPING_KM} km.`,
    };
  }

  const shippingFee = shippingFeeFromDistance(buyer, distanceKm);
  if (shippingFee == null) {
    return {
      valid: false,
      shippingFee: 0,
      distanceKm,
      buyerLocationLabel: buyer.label,
      sellerOriginLabel: seller.label,
      sellerLocationEstimated: seller.estimated,
      error: `La dirección está a ${distanceKm} km de Córdoba Capital. El envío a domicilio solo está disponible hasta ${MAX_CORDOBA_SHIPPING_KM} km.`,
    };
  }

  return {
    valid: true,
    shippingFee,
    distanceKm,
    buyerLocationLabel: buyer.label,
    sellerOriginLabel: seller.label,
    sellerLocationEstimated: seller.estimated,
    error: null,
  };
}

/** Valida una dirección guardada en Ajustes para envío a domicilio. */
export function validateAddressForHomeDelivery(parts: {
  line1?: string | null;
  city?: string | null;
  region?: string | null;
}): HomeDeliveryValidation {
  const seller = inferSellerOrigin(null);
  const buyer = resolveLocalityFromAddress(parts);

  if (!buyer) {
    const region = (parts.region ?? "").trim();
    if (isNonCordobaProvinceText(region) || isNonCordobaProvinceText(parts.city)) {
      return {
        valid: false,
        shippingFee: 0,
        distanceKm: null,
        buyerLocationLabel: [parts.line1, parts.city, region].filter(Boolean).join(", "),
        sellerOriginLabel: seller.label,
        sellerLocationEstimated: false,
        error: "El envío a domicilio solo está disponible dentro de la provincia de Córdoba.",
      };
    }
    return {
      valid: false,
      shippingFee: 0,
      distanceKm: null,
      buyerLocationLabel: "",
      sellerOriginLabel: seller.label,
      sellerLocationEstimated: false,
      error:
        "No pudimos ubicar esta dirección en Córdoba. Revisá ciudad y provincia (deben ser localidades de Córdoba).",
    };
  }

  return validateHomeDelivery({
    sellerLocation: "Córdoba",
    buyerLocalityId: buyer.id,
  });
}
