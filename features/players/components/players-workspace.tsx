"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PlayerForm } from "./player-form";
import { PlayerTable } from "./player-table";
import type { AccountMovementRecord, PlayerRecord } from "../types";

export function PlayersWorkspace({ players, movements }: { players: PlayerRecord[]; movements: AccountMovementRecord[] }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm text-slate-500">{players.length} jugadores activos</p></div><button type="button" onClick={() => setShowCreate((current) => !current)} className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700">{showCreate ? "Cerrar formulario" : "Nuevo jugador"}</button></div>
    {showCreate && <Card><CardHeader><h2 className="text-lg font-semibold text-slate-900">Nuevo jugador</h2><p className="mt-1 text-sm text-slate-500">Los teléfonos se conservan por separado para permitir múltiples números.</p></CardHeader><CardContent><PlayerForm onSuccess={() => { setShowCreate(false); router.refresh(); }} onCancel={() => setShowCreate(false)} /></CardContent></Card>}
    <PlayerTable players={players} movements={movements} onRefresh={() => router.refresh()} />
  </div>;
}