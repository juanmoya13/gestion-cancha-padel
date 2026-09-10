import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageContainer } from "@/components/layout/page-container";
import { getActiveProducts } from "@/features/products/queries";
import { getPlayers } from "@/features/players/queries";
import { SaleForm } from "@/features/sales/components/sale-form";
import { SaleTable } from "@/features/sales/components/sale-table";
import { getSales } from "@/features/sales/queries";

export default async function SalesPage() {
  const [products, players, sales] = await Promise.all([getActiveProducts(), getPlayers(), getSales()]);
  return <PageContainer><div className="mb-8"><p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Ingresos y alquileres</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Ventas</h1><p className="mt-2 text-slate-500">Registra productos y alquileres de cancha en una única operación.</p></div><div className="space-y-6"><Card><CardHeader><h2 className="text-lg font-semibold text-slate-900">Nueva venta o alquiler</h2><p className="mt-1 text-sm text-slate-500">El alquiler se identifica por el producto y no requiere agenda ni reserva.</p></CardHeader><CardContent>{products.length === 0 ? <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">Primero crea productos para registrar una venta.</p> : <SaleForm products={products} players={players} />}</CardContent></Card><Card><CardHeader><h2 className="text-lg font-semibold text-slate-900">Historial de ventas</h2></CardHeader><CardContent className="p-0"><SaleTable sales={sales} /></CardContent></Card></div></PageContainer>;
}