export const PREMIUM_PRICE_LABEL = "$25.000";
export const PREMIUM_PRICE_PERIOD = "/ mes";

export const PREMIUM_BENEFITS = [
  {
    title: "0% comisión por ventas",
    description: "Te quedás con el total de cada venta, sin porcentaje de la plataforma.",
  },
  {
    title: "Perfil verificado",
    description: "Badge verificado para que compradores identifiquen tu negocio al instante.",
  },
  {
    title: "Prioridad en búsquedas",
    description: "Tus productos aparecen primero cuando alguien busca en Colex.",
  },
  {
    title: "Destacado en la home",
    description: "Publicaciones visibles en la sección de productos destacados.",
  },
  {
    title: "Mayor visibilidad",
    description: "Más exposición en fichas de producto y en combos del marketplace.",
  },
  {
    title: "Negocios destacados",
    description: 'Logo de tu negocio en la sección "Negocios destacados".',
  },
  {
    title: "Badge Premium",
    description: "Distintivo Premium en tu perfil y en cada publicación.",
  },
] as const;

export type PlanComparisonRow = {
  feature: string;
  free: string;
  premium: string;
  premiumHighlight?: boolean;
};

export const PLAN_COMPARISON: PlanComparisonRow[] = [
  {
    feature: "Comisión por ventas",
    free: "Comisión estándar",
    premium: "0%",
    premiumHighlight: true,
  },
  {
    feature: "Perfil verificado",
    free: "No",
    premium: "Sí",
    premiumHighlight: true,
  },
  {
    feature: "Prioridad en búsquedas",
    free: "No",
    premium: "Sí",
    premiumHighlight: true,
  },
  {
    feature: "Publicaciones en home",
    free: "No",
    premium: "Destacadas",
    premiumHighlight: true,
  },
  {
    feature: "Visibilidad productos y combos",
    free: "Estándar",
    premium: "Mayor",
    premiumHighlight: true,
  },
  {
    feature: "Negocios destacados",
    free: "No",
    premium: "Logo incluido",
    premiumHighlight: true,
  },
  {
    feature: "Badge Premium",
    free: "No",
    premium: "Sí",
    premiumHighlight: true,
  },
];

export const PREMIUM_BENEFIT_SHORT = PREMIUM_BENEFITS.map((b) => b.title);
