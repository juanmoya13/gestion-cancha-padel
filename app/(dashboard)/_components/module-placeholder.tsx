import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/layout/page-container";

export function ModulePlaceholder({ title, description }: { title: string; description: string }) {
  return <PageContainer><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Módulo administrativo</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{title}</h1><p className="mt-2 text-slate-500">Esta sección ya está disponible en la navegación.</p><div className="mt-8"><EmptyState title="Funcionalidad en preparación" description={description} /></div></PageContainer>;
}