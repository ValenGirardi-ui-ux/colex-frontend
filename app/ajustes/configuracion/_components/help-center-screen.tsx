"use client";

import { useMemo, useState } from "react";
import { ContactSupportCard } from "./contact-support-card";
import { FAQAccordion } from "./faq-accordion";
import { HelpCategoryMenu } from "./help-category-menu";
import { HelpHeader } from "./help-header";
import { HelpTopicCard } from "./help-topic-card";
import type { HelpCategory, HelpFaq, HelpTopic } from "./help-center-types";
import { QuickAccessChips } from "./quick-access-chips";

const quickAccessItems = [
  "Publicar un artículo",
  "Comprar de forma segura",
  "Medios de pago",
  "Envíos y entregas",
  "Editar mi perfil",
  "Reportar un problema",
];

const categories: HelpCategory[] = [
  { id: "all", name: "Todo", description: "Todos los temas del centro de ayuda de Colex.", icon: "📚" },
  { id: "mi-cuenta", name: "Mi cuenta", description: "Accesos, perfil y datos de tu cuenta.", icon: "👤" },
  { id: "comprar", name: "Comprar en Colex", description: "Cómo buscar y comprar artículos escolares.", icon: "🛒" },
  { id: "vender", name: "Vender en Colex", description: "Publicá útiles, uniformes y artículos institucionales.", icon: "🏷️" },
  { id: "publicaciones", name: "Publicaciones", description: "Creación y edición de avisos de venta.", icon: "📝" },
  { id: "pagos", name: "Pagos", description: "Medios de pago, validaciones y comprobantes.", icon: "💳" },
  { id: "envios", name: "Envíos y entregas", description: "Coordinación de entrega y retiro seguro.", icon: "📦" },
  { id: "seguridad", name: "Seguridad", description: "Buenas prácticas para una experiencia confiable.", icon: "🔒" },
  { id: "soporte", name: "Soporte", description: "Canales de ayuda para resolver incidencias.", icon: "🛟" },
];

const topics: HelpTopic[] = [
  {
    id: "publicar-articulo",
    categoryId: "publicaciones",
    icon: "📝",
    title: "Cómo publicar un artículo",
    description: "Creá publicaciones claras para uniformes, libros, mochilas y útiles escolares.",
  },
  {
    id: "comprar-colex",
    categoryId: "comprar",
    icon: "🛒",
    title: "Cómo comprar en Colex",
    description: "Filtrá por institución, estado del producto y acordá la compra en pocos pasos.",
  },
  {
    id: "funcionan-pagos",
    categoryId: "pagos",
    icon: "💳",
    title: "Cómo funcionan los pagos",
    description: "Consultá los medios de pago disponibles y cómo validar transacciones.",
  },
  {
    id: "coordinar-entrega",
    categoryId: "envios",
    icon: "📦",
    title: "Cómo coordinar la entrega",
    description: "Definí retiro o entrega en punto seguro con horarios claros para ambas partes.",
  },
];

const faqs: HelpFaq[] = [
  {
    id: "faq-1",
    categoryId: "vender",
    question: "¿Qué puedo vender en Colex?",
    answer:
      "Podés vender artículos escolares o institucionales, nuevos o usados, como uniformes, libros, útiles, mochilas y materiales de estudio.",
  },
  {
    id: "faq-2",
    categoryId: "publicaciones",
    question: "¿Cómo edito una publicación?",
    answer:
      "Ingresá a Mis publicaciones, seleccioná el artículo y usá Editar. Podés ajustar fotos, precio, descripción y estado del producto.",
  },
  {
    id: "faq-3",
    categoryId: "comprar",
    question: "¿Cómo contacto a un vendedor?",
    answer:
      "Desde la publicación, tocá Contactar y enviá tu consulta. Recomendamos confirmar estado, forma de pago y punto de encuentro.",
  },
  {
    id: "faq-4",
    categoryId: "soporte",
    question: "¿Qué hago si tengo un problema con una compra?",
    answer:
      "Usá Reportar un problema desde la operación. El equipo de soporte revisará el caso y te contactará con los pasos a seguir.",
  },
  {
    id: "faq-5",
    categoryId: "mi-cuenta",
    question: "¿Cómo cambio mis datos de cuenta?",
    answer:
      "En Configuración > Mi cuenta podés actualizar nombre, correo, contraseña y preferencias de notificaciones.",
  },
];

const specificHelpBlocks = [
  {
    title: "Verificar mi perfil institucional",
    description: "Te guiamos para validar datos y generar más confianza al comprar o vender.",
  },
  {
    title: "Optimizar una publicación",
    description: "Consejos rápidos para mejorar visibilidad, precio y calidad de tus anuncios.",
  },
];

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function HelpCenterScreen() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [query, setQuery] = useState("");

  const normalizedQuery = normalizeText(query);

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      const inCategory = selectedCategoryId === "all" || topic.categoryId === selectedCategoryId;
      if (!inCategory) return false;
      if (!normalizedQuery) return true;
      const haystack = normalizeText(`${topic.title} ${topic.description}`);
      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery, selectedCategoryId]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const inCategory = selectedCategoryId === "all" || faq.categoryId === selectedCategoryId;
      if (!inCategory) return false;
      if (!normalizedQuery) return true;
      const haystack = normalizeText(`${faq.question} ${faq.answer}`);
      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery, selectedCategoryId]);

  const totalMatches = filteredTopics.length + filteredFaqs.length;

  return (
    <div className="space-y-6">
      <HelpHeader query={query} onQueryChange={setQuery} totalMatches={totalMatches} />

      <QuickAccessChips items={quickAccessItems} onSelect={setQuery} />

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <HelpCategoryMenu
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />

        <div className="space-y-6">
          {totalMatches === 0 ? (
            <section className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
              <p className="text-lg font-semibold text-zinc-900">No encontramos resultados</p>
              <p className="mt-2 text-sm text-zinc-600">
                Probá con otra palabra clave o cambiá de categoría para encontrar ayuda.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSelectedCategoryId("all");
                }}
                className="mt-4 rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-700 transition hover:border-[#0A8FA1] hover:text-[#0A8FA1]"
              >
                Limpiar búsqueda
              </button>
            </section>
          ) : (
            <>
              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-zinc-900">Temas recomendados</h3>
                <div className="space-y-3">
                  {filteredTopics.map((topic) => (
                    <HelpTopicCard
                      key={topic.id}
                      icon={topic.icon}
                      title={topic.title}
                      description={topic.description}
                    />
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-zinc-900">Preguntas frecuentes</h3>
                <FAQAccordion items={filteredFaqs} />
              </section>
            </>
          )}

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-zinc-900">Necesito ayuda con algo específico</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {specificHelpBlocks.map((block) => (
                <article
                  key={block.title}
                  className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300"
                >
                  <p className="text-sm font-semibold text-zinc-900">{block.title}</p>
                  <p className="mt-1 text-sm text-zinc-600">{block.description}</p>
                </article>
              ))}
            </div>
          </section>

          <ContactSupportCard />
        </div>
      </div>
    </div>
  );
}
