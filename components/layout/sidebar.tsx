"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, Boxes, CircleDollarSign, ClipboardList, LayoutDashboard, Menu, ShoppingCart, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/ventas", label: "Ventas", icon: ShoppingCart },
  { href: "/productos", label: "Productos", icon: Boxes },
  { href: "/stock", label: "Stock", icon: ClipboardList },
  { href: "/jugadores", label: "Jugadores", icon: Users },
  { href: "/cuenta-corriente", label: "Cuenta corriente", icon: CircleDollarSign },
  { href: "/compras", label: "Compras", icon: ClipboardList },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/historial", label: "Historial", icon: ClipboardList },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button className="fixed right-4 top-4 z-30 rounded-lg bg-[#17221f] p-3 text-white md:hidden" onClick={() => setIsOpen((open) => !open)} aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}>
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      {isOpen && <button className="fixed inset-0 z-20 bg-[#17221f]/40 md:hidden" onClick={() => setIsOpen(false)} aria-label="Cerrar menú" />}
      <aside className={cn("fixed inset-y-0 left-0 z-20 flex w-72 -translate-x-full flex-col bg-[#17221f] text-slate-100 transition-transform md:static md:translate-x-0", isOpen && "translate-x-0")}>
        <div className="border-b border-white/10 px-7 py-7">
          <p className="text-2xl font-semibold tracking-tight text-emerald-300">PÁDEL</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.25em] text-slate-400">Panel administrador</p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          {navigation.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
            return <Link key={href} href={href} onClick={() => setIsOpen(false)} className={cn("flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/10 hover:text-white", isActive && "bg-emerald-600 text-white shadow-lg shadow-emerald-950/30")}><Icon size={18} aria-hidden="true" /><span>{label}</span></Link>;
          })}
        </nav>
        <div className="border-t border-white/10 px-7 py-5 text-xs text-slate-500">MVP · Gestión administrativa</div>
      </aside>
    </>
  );
}