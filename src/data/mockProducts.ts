import type { Product } from "@/src/types/product";
import { priceLabelToArs } from "@/src/lib/money";

type LegacyMockProduct = {
  id: string;
  title: string;
  institution: string | null;
  condition: Product["condition"];
  priceLabel: string;
  location: string;
  description: string;
  category: string;
  size: string | null;
  publishedAt: string;
  imageUrl: string | null;
  newCondition?: Product["new_condition"];
  usedCondition?: Product["used_condition"];
  /** Dueño del listado en mocks de perfil */
  sellerUserId?: string;
};

const LEGACY_CATALOG: LegacyMockProduct[] = [
  {
    id: "h-201",
    title: "Uniforme completo verano, talle 12",
    institution: "Colegio Nacional",
    condition: "usado",
    priceLabel: "$ 18.500",
    location: "Palermo, CABA",
    imageUrl: null,
    description: "Conjunto de verano: camisa manga corta, pantalón y corbata. Poco uso, en buen estado.",
    category: "Uniformes",
    size: "Talle 12 / niño",
    publishedAt: "2025-02-12T14:00:00.000Z",
  },
  {
    id: "h-202",
    title: "Pack Geografía + Historia, 1° año",
    institution: "Instituto Modelo",
    condition: "nuevo",
    priceLabel: "$ 14.200",
    location: "Villa Urquiza",
    imageUrl: null,
    description: "Textos oficiales del ciclo, sin anotaciones. Se vende pack cerrado.",
    category: "Libros",
    size: null,
    publishedAt: "2025-03-01T10:30:00.000Z",
  },
  {
    id: "h-203",
    title: "Mochila con ruedas, 40 L",
    institution: null,
    condition: "usado",
    priceLabel: "$ 42.000",
    location: "Zona Oeste, GBA",
    imageUrl: null,
    description: "Mochila con ruedas y asa. Capacidad 40 L.",
    category: "Mochilas",
    size: "Capacidad 40 L",
    publishedAt: "2025-01-20T16:00:00.000Z",
    sellerUserId: "seller-lucia",
  },
  {
    id: "h-204",
    title: "Guardapolvo blanco, talle M",
    institution: "Escuela Técnica N°2",
    condition: "nuevo",
    priceLabel: "$ 9.800",
    location: "Rosario",
    imageUrl: null,
    description: "Guardapolvo blanco sin bordar. Etiqueta original.",
    category: "Guardapolvos",
    size: "M",
    publishedAt: "2025-04-18T12:00:00.000Z",
    sellerUserId: "seller-lucia",
  },
  {
    id: "h-205",
    title: "Zapatillas colegiales talle 38",
    institution: "St. Mary’s",
    condition: "usado",
    priceLabel: "$ 22.000",
    location: "Núñez, CABA",
    imageUrl: null,
    description: "Blancas, cordones nuevos, suela con uso moderado.",
    category: "Calzado",
    size: "38",
    publishedAt: "2025-02-28T09:00:00.000Z",
    sellerUserId: "seller-lucia",
  },
  {
    id: "h-206",
    title: "Casio calculadora científica",
    institution: null,
    condition: "usado",
    priceLabel: "$ 11.500",
    location: "Córdoba Capital",
    imageUrl: null,
    description: "Modelo aceptado en cursos de física. Pilas al día.",
    category: "Útiles escolares",
    size: null,
    publishedAt: "2025-01-05T11:00:00.000Z",
    sellerUserId: "seller-lucia",
  },
  {
    id: "h-207",
    title: "Set geometría + carpeta A4 reforzada",
    institution: "Colegio Alemán",
    condition: "nuevo",
    priceLabel: "$ 6.400",
    location: "Belgrano",
    imageUrl: null,
    description: "Compás metálico, escuadra, transportador y regla.",
    category: "Útiles escolares",
    size: null,
    publishedAt: "2025-03-22T18:00:00.000Z",
  },
  {
    id: "h-208",
    title: "Buzo deportivo, talle 10",
    institution: "Club Atlético escolar",
    condition: "usado",
    priceLabel: "$ 7.200",
    location: "Quilmes",
    imageUrl: null,
    description: "Buzo canguro con cierre. Bordado institucional.",
    category: "Indumentaria institucional",
    size: "10 / niño",
    publishedAt: "2024-12-10T20:00:00.000Z",
    sellerUserId: "seller-lucia",
  },
  {
    id: "p-1001",
    title: "Mochila negra Nike, talle L",
    institution: "Colegio San Martín",
    condition: "usado",
    priceLabel: "$ 53.000",
    location: "CABA",
    imageUrl: null,
    description: "Mochila Nike color negro, talle L. Bolsillos con cierre.",
    category: "Mochilas",
    size: "L",
    publishedAt: "2025-04-01T15:00:00.000Z",
    sellerUserId: "mock-user",
  },
  {
    id: "p-1002",
    title: "Libro Matemática Polimodal — 2do año",
    institution: "Instituto Modelo",
    condition: "nuevo",
    priceLabel: "$ 12.500",
    location: "Zona Norte, GBA",
    imageUrl: null,
    description: "ISBN visible en contratapa. Sin raya ni nombre.",
    category: "Libros",
    size: null,
    publishedAt: "2025-02-15T10:00:00.000Z",
    sellerUserId: "seller-lucia",
  },
  {
    id: "p-1003",
    title: "Uniforme verano, camisa y pollera talle 14",
    institution: "St. Mary’s School",
    condition: "usado",
    priceLabel: "$ 28.000",
    location: "Córdoba Capital",
    imageUrl: null,
    description: "Conjunto reglamentario, camisa blanca y pollera.",
    category: "Uniformes",
    size: "14",
    publishedAt: "2025-01-28T12:00:00.000Z",
    sellerUserId: "seller-lucia",
  },
  {
    id: "p-1004",
    title: "Pack útiles: reglas, compás y transportador",
    institution: null,
    condition: "nuevo",
    priceLabel: "$ 8.900",
    location: "Envíos a todo el país",
    imageUrl: null,
    description: "Lote básico de geometría, sin caja.",
    category: "Útiles escolares",
    size: null,
    publishedAt: "2025-03-05T14:00:00.000Z",
    sellerUserId: "seller-lucia",
  },
  {
    id: "p-1005",
    title: "Tablet con funda para clases híbridas",
    institution: "Escuela Técnica N° 1",
    condition: "usado",
    priceLabel: "$ 120.000",
    location: "Rosario",
    imageUrl: null,
    description: "Dispositivo desbloqueado, funda y cargador incluidos.",
    category: "Accesorios",
    size: null,
    publishedAt: "2024-11-30T19:00:00.000Z",
    sellerUserId: "seller-lucia",
  },
];

const DEFAULT_USER_ID = "mock-user";
const NEW_CONDITION_BY_ID: Record<string, Product["new_condition"]> = {
  "h-202": "con_etiqueta",
  "h-204": "sin_etiqueta",
  "h-207": "con_etiqueta",
  "p-1002": "sin_etiqueta",
  "p-1004": "con_etiqueta",
};
const USED_CONDITION_BY_ID: Record<string, Product["used_condition"]> = {
  "h-201": "algo_desgastado",
  "h-203": "casi_nuevo",
  "h-205": "algo_desgastado",
  "h-206": "bastante_desgastado",
  "h-208": "algo_desgastado",
  "p-1001": "casi_nuevo",
  "p-1003": "bastante_desgastado",
  "p-1005": "roto",
};

function toProduct(legacy: LegacyMockProduct): Product {
  return {
    id: legacy.id,
    user_id: legacy.sellerUserId ?? DEFAULT_USER_ID,
    title: legacy.title,
    description: legacy.description,
    price: priceLabelToArs(legacy.priceLabel),
    category: legacy.category,
    condition: legacy.condition,
    new_condition:
      legacy.condition === "nuevo" ? legacy.newCondition ?? NEW_CONDITION_BY_ID[legacy.id] ?? "sin_etiqueta" : null,
    used_condition:
      legacy.condition === "usado" ? legacy.usedCondition ?? USED_CONDITION_BY_ID[legacy.id] ?? "algo_desgastado" : null,
    institution: legacy.institution,
    brand: null,
    location: legacy.location,
    size: legacy.size,
    delivery_method: null,
    status: "active",
    created_at: legacy.publishedAt,
    images: legacy.imageUrl ? [legacy.imageUrl] : [],
  };
}

const CATALOG: Product[] = LEGACY_CATALOG.map(toProduct);

export function getProductDetailById(id: string): Product | undefined {
  return CATALOG.find((p) => p.id === id);
}

export function toListProduct(p: Product): Product {
  return p;
}

const HOME_FEATURED_IDS = ["h-201", "h-202", "h-203", "h-204", "h-205", "h-206", "h-207", "h-208"] as const;
const FAV_IDS = ["p-1001", "p-1002", "p-1003", "p-1004", "p-1005"] as const;

export const homeFeaturedProducts: Product[] = HOME_FEATURED_IDS.map((id) => toListProduct(CATALOG.find((p) => p.id === id)!));
export const mockFavoriteProducts: Product[] = FAV_IDS.map((id) => toListProduct(CATALOG.find((p) => p.id === id)!));

export function getAllListProducts(): Product[] {
  return CATALOG.map(toListProduct);
}

export function getRelatedListProducts(excludeId: string, limit = 4): Product[] {
  const self = CATALOG.find((p) => p.id === excludeId);
  const same = CATALOG.filter((p) => p.id !== excludeId && self && p.category === self.category);
  const rest = CATALOG.filter((p) => p.id !== excludeId && !same.includes(p));
  return [...same, ...rest].slice(0, limit).map(toListProduct);
}

export function getProductsBySellerId(userId: string): Product[] {
  return CATALOG.filter((p) => p.user_id === userId).map(toListProduct);
}
