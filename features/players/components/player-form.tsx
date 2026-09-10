"use client";

import { useState, useTransition } from "react";
import { createPlayerAction, updatePlayerAction } from "@/actions/players";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PlayerRecord } from "../types";

interface PlayerFormProps {
  player?: PlayerRecord;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function PlayerForm({ player, onSuccess, onCancel }: PlayerFormProps) {
  const [isPending, startTransition] = useTransition();
  const [firstName, setFirstName] = useState(player?.first_name ?? "");
  const [lastName, setLastName] = useState(player?.last_name ?? "");
  const [gender, setGender] = useState(player?.gender ?? "");
  const [skillLevel, setSkillLevel] = useState(player?.skill_level?.toString() ?? "");
  const [phones, setPhones] = useState(player?.phones.map((phone) => phone.phone_number) ?? [""]);
  const [error, setError] = useState<string>();

  function updatePhone(index: number, value: string) {
    setPhones((current) => current.map((phone, phoneIndex) => phoneIndex === index ? value : phone));
  }

  function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    startTransition(async () => {
      const input = { firstName, lastName, gender, skillLevel: skillLevel ? Number(skillLevel) : undefined, phones };
      const result = player ? await updatePlayerAction({ ...input, playerId: player.id }) : await createPlayerAction(input);
      if (result.error) {
        setError(result.error);
        return;
      }
      onSuccess();
    });
  }

  return <form onSubmit={submitForm} className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="space-y-2 text-sm font-medium text-slate-700">Nombre<Input value={firstName} onChange={(event) => setFirstName(event.target.value)} required /></label>
      <label className="space-y-2 text-sm font-medium text-slate-700">Apellido<Input value={lastName} onChange={(event) => setLastName(event.target.value)} required /></label>
      <label className="space-y-2 text-sm font-medium text-slate-700">Género <span className="font-normal text-slate-400">(opcional)</span><Input value={gender} onChange={(event) => setGender(event.target.value)} /></label>
      <label className="space-y-2 text-sm font-medium text-slate-700">Nivel <span className="font-normal text-slate-400">(1 a 10)</span><Input type="number" min="1" max="10" value={skillLevel} onChange={(event) => setSkillLevel(event.target.value)} /></label>
    </div>
    <div className="space-y-3">
      <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-slate-700">Teléfonos</h3><Button type="button" className="h-9 bg-slate-100 px-3 text-slate-700 hover:bg-slate-200" onClick={() => setPhones((current) => [...current, ""])}>Agregar teléfono</Button></div>
      {phones.map((phone, index) => <div key={index} className="flex gap-2"><Input value={phone} onChange={(event) => updatePhone(index, event.target.value)} placeholder="Ej. 11 5555 5555" required /><Button type="button" aria-label="Quitar teléfono" className="bg-red-50 px-3 text-red-700 hover:bg-red-100" onClick={() => setPhones((current) => current.length === 1 ? current : current.filter((_, phoneIndex) => phoneIndex !== index))} disabled={phones.length === 1}>Quitar</Button></div>)}
    </div>
    {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    <div className="flex justify-end gap-3">{onCancel && <Button type="button" className="bg-slate-100 text-slate-700 hover:bg-slate-200" onClick={onCancel}>Cancelar</Button>}<Button type="submit" disabled={isPending}>{isPending ? "Guardando..." : player ? "Guardar cambios" : "Crear jugador"}</Button></div>
  </form>;
}