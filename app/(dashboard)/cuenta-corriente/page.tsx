import { PageContainer } from "@/components/layout/page-container";
import { PlayersWorkspace } from "@/features/players/components/players-workspace";
import { getAccountMovements, getPlayers } from "@/features/players/queries";

export default async function AccountPage() {
  const [players, movements] = await Promise.all([getPlayers(), getAccountMovements()]);
  return <PageContainer><div className="mb-8"><p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Ledger de jugadores</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Cuenta corriente</h1><p className="mt-2 text-slate-500">Registra cobros, ajustes y consulta el historial inmutable de cada cuenta.</p></div><PlayersWorkspace players={players} movements={movements} /></PageContainer>;
}