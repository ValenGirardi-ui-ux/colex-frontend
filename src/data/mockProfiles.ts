export type MockPublicProfile = {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string | null;
  location: string;
  institution: string | null;
  memberSinceIso: string;
  bio: string;
  visibleContact: string | null;
  /** Valores mock hasta conectar métricas reales */
  salesCount: number;
  purchasesCount: number;
};

export const MOCK_CURRENT_USER_ID = "mock-user";

const PROFILES: Record<string, MockPublicProfile> = {
  [MOCK_CURRENT_USER_ID]: {
    id: MOCK_CURRENT_USER_ID,
    displayName: "María González",
    handle: "@mariagonzalez",
    avatarUrl: null,
    location: "Belgrano, CABA",
    institution: "Colegio San Martín",
    memberSinceIso: "2024-06-15T12:00:00.000Z",
    bio: "Mamá de dos: compro y vendo útiles, uniformes y lectura para el colegio. Prefiero coordinar retiro o envío con seguimiento. ¡Gracias por confiar!",
    visibleContact: "Solo mensajes por Colex",
    salesCount: 12,
    purchasesCount: 28,
  },
  "seller-lucia": {
    id: "seller-lucia",
    displayName: "Lucía Fernández",
    handle: "@luciafernandez",
    avatarUrl: null,
    location: "Rosario, Santa Fe",
    institution: "Escuela Técnica N°2",
    memberSinceIso: "2023-11-02T09:00:00.000Z",
    bio: "Estudiante y revendedora de material escolar en buen estado. Respondo rápido por mensaje.",
    visibleContact: "+54 9 341 600-0000",
    salesCount: 34,
    purchasesCount: 9,
  },
};

export function getMockProfileById(id: string): MockPublicProfile | undefined {
  return PROFILES[id];
}

export function formatMemberSince(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(d);
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}
