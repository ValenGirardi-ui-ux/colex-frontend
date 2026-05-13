import Link from "next/link";

type HelpTopicCardProps = {
  icon: string;
  title: string;
  description: string;
};

export function HelpTopicCard({ icon, title, description }: HelpTopicCardProps) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span aria-hidden className="text-xl">
            {icon}
          </span>
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-zinc-900">{title}</h4>
            <p className="text-sm text-zinc-600">{description}</p>
          </div>
        </div>
        <Link
          href="#"
          className="shrink-0 rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 transition hover:border-[#0A8FA1] hover:text-[#0A8FA1]"
        >
          Ver más
        </Link>
      </div>
    </article>
  );
}
