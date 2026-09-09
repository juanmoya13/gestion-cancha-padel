import { Construction } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <section className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 text-center"><Construction className="text-emerald-600" size={28} aria-hidden="true" /><h2 className="mt-4 text-lg font-semibold text-slate-800">{title}</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p></section>;
}