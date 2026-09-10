import { PageContainer } from "@/components/layout/page-container";
import { AnalyticsView } from "@/features/reports/components/analytics-view";
import { getAnalyticsSnapshot } from "@/features/reports/queries";

export default async function ReportsPage() {
  const snapshot = await getAnalyticsSnapshot();
  return <PageContainer><div className="mb-8"><p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Indicadores del negocio</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Reportes</h1><p className="mt-2 text-slate-500">Ingresos, gastos, alquileres, saldos y rankings calculados desde operaciones válidas.</p></div><AnalyticsView snapshot={snapshot} /></PageContainer>;
}