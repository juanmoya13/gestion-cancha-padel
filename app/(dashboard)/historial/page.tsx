import { PageContainer } from "@/components/layout/page-container";
import { HistoryView } from "@/features/history/components/history-view";
import { getOperationHistory } from "@/features/history/queries";

export default async function HistoryPage() {
  const history = await getOperationHistory();
  return <PageContainer><div className="mb-8"><p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Trazabilidad completa</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Historial</h1><p className="mt-2 text-slate-500">Consulta ventas, compras, stock y cuenta corriente sin perder operaciones anuladas.</p></div><HistoryView history={history} /></PageContainer>;
}