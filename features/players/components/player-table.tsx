"use client";

import { useMemo, useState, useTransition } from "react";
import { adjustAccountBalanceAction, recordPaymentAction } from "@/actions/account";
import { deletePlayerAction } from "@/actions/players";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { AccountBadge } from "./account-badge";
import { AccountMovementTable } from "./account-movement-table";
import { PlayerForm } from "./player-form";
import type { AccountMovementRecord, PlayerRecord } from "../types";

interface PlayerTableProps { players: PlayerRecord[]; movements: AccountMovementRecord[]; onRefresh: () => void; }

export function PlayerTable({ players, movements, onRefresh }: PlayerTableProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>();
  const [editingId, setEditingId] = useState<string>();
  const [operation, setOperation] = useState<"payment" | "adjustment">();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const filteredPlayers = useMemo(() => { const term = search.toLocaleLowerCase().trim(); return players.filter((player) => !term || `${player.first_name} ${player.last_name} ${player.phones.map((phone) => phone.phone_number).join(" ")}`.toLocaleLowerCase().includes(term)); }, [players, search]);
  const selectedPlayer = players.find((player) => player.id === selectedId);
  const editingPlayer = players.find((player) => player.id === editingId);

  function submitAccountOperation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPlayer) return;
    setError(undefined);
    startTransition(async () => {
      const result = operation === "payment"
        ? await recordPaymentAction({ playerId: selectedPlayer.id, amount: Number(amount), notes: reason })
        : await adjustAccountBalanceAction({ playerId: selectedPlayer.id, amountChange: Number(amount), reason });
      if (result.error) { setError(result.error); return; }
      setAmount(""); setReason(""); setOperation(undefined); onRefresh();
    });
  }

  function removePlayer(player: PlayerRecord) {
    if (!window.confirm(`¿Eliminar a ${player.first_name} ${player.last_name}?`)) return;
    startTransition(async () => { const result = await deletePlayerAction(player.id); if (result.error) setError(result.error); else onRefresh(); });
  }

  return <div className="space-y-4">
    <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o teléfono" />
    <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Jugador</th><th className="px-4 py-3">Teléfonos</th><th className="px-4 py-3">Nivel</th><th className="px-4 py-3">Cuenta</th><th className="px-4 py-3 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredPlayers.map((player) => <tr key={player.id}><td className="px-4 py-4 font-semibold text-slate-800">{player.first_name} {player.last_name}<span className="block text-xs font-normal text-slate-500">{player.gender ?? "Género no indicado"}</span></td><td className="px-4 py-4 text-slate-600">{player.phones.map((phone) => phone.phone_number).join(", ")}</td><td className="px-4 py-4 text-slate-600">{player.skill_level ?? "-"}</td><td className="px-4 py-4"><AccountBadge balance={player.current_balance} /></td><td className="px-4 py-4"><div className="flex justify-end gap-2"><Button className="h-9 bg-emerald-50 px-3 text-emerald-700 hover:bg-emerald-100" onClick={() => { setSelectedId(player.id); setOperation("payment"); setError(undefined); }}>Cobrar</Button><Button className="h-9 bg-amber-50 px-3 text-amber-700 hover:bg-amber-100" onClick={() => { setSelectedId(player.id); setOperation("adjustment"); setError(undefined); }}>Ajustar</Button><Button className="h-9 bg-slate-100 px-3 text-slate-700 hover:bg-slate-200" onClick={() => setEditingId(player.id)}>Editar</Button><Button className="h-9 bg-red-50 px-3 text-red-700 hover:bg-red-100" onClick={() => removePlayer(player)} disabled={isPending}>Eliminar</Button></div></td></tr>)}</tbody></table>{filteredPlayers.length === 0 && <p className="px-6 py-10 text-center text-sm text-slate-500">No se encontraron jugadores.</p>}</div>
    {selectedPlayer && operation && <Card><CardHeader><h2 className="text-lg font-semibold text-slate-900">{operation === "payment" ? "Registrar cobro" : "Ajustar cuenta"}: {selectedPlayer.first_name} {selectedPlayer.last_name}</h2><p className="text-sm text-slate-500">Saldo actual: {formatCurrency(selectedPlayer.current_balance)}</p></CardHeader><CardContent><form onSubmit={submitAccountOperation} className="grid gap-4 sm:grid-cols-[1fr_1.5fr_auto]"><label className="space-y-2 text-sm font-medium text-slate-700">{operation === "payment" ? "Importe del cobro" : "Variación del saldo"}<Input type="number" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required /></label><label className="space-y-2 text-sm font-medium text-slate-700">{operation === "payment" ? "Notas (opcional)" : "Motivo (opcional)"}<Input value={reason} onChange={(event) => setReason(event.target.value)} /></label><Button type="submit" disabled={isPending} className="self-end">{isPending ? "Guardando..." : "Confirmar"}</Button></form>{error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}<div className="mt-6 border-t border-slate-100 pt-4"><h3 className="mb-3 text-sm font-semibold text-slate-700">Movimientos recientes</h3><AccountMovementTable movements={movements.filter((movement) => movement.player_id === selectedPlayer.id)} /></div></CardContent></Card>}
    {editingPlayer && <Card><CardHeader><h2 className="text-lg font-semibold text-slate-900">Editar jugador</h2></CardHeader><CardContent><PlayerForm player={editingPlayer} onSuccess={() => { setEditingId(undefined); onRefresh(); }} onCancel={() => setEditingId(undefined)} /></CardContent></Card>}
  </div>;
}