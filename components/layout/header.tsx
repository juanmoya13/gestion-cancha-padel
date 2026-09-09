import { LogOut } from "lucide-react";
import { signOutAction } from "@/actions/auth";

export function Header({ email }: { email?: string }) {
  return <header className="flex min-h-20 items-center justify-between border-b border-slate-200 bg-white px-6 py-4 md:px-10"><div className="pl-12 md:pl-0"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Operación diaria</p><p className="mt-1 text-sm text-slate-500">Complejo de pádel</p></div><div className="flex items-center gap-4"><span className="hidden text-sm text-slate-500 sm:block">{email}</span><form action={signOutAction}><button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:text-red-600" type="submit"><LogOut size={16} aria-hidden="true" /><span className="hidden sm:inline">Cerrar sesión</span></button></form></div></header>;
}