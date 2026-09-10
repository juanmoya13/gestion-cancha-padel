import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageContainer } from "@/components/layout/page-container";
import { getActiveProducts } from "@/features/products/queries";
import { PurchaseForm } from "@/features/purchases/components/purchase-form";
import { PurchaseTable } from "@/features/purchases/components/purchase-table";
import { getPurchases } from "@/features/purchases/queries";

export default async function PurchasesPage() {
  const [products, purchases] = await Promise.all([getActiveProducts(), getPurchases()]);
  const physicalProducts = products.filter((product) => !product.is_court_rental);

  return <PageContainer><div className="mb-8"><p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Reposición e inventario</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Compras</h1><p className="mt-2 text-slate-500">Registra compras pagadas y actualiza el stock conservando cada precio histórico.</p></div><div className="space-y-6"><Card><CardHeader><h2 className="text-lg font-semibold text-slate-900">Nueva compra</h2><p className="mt-1 text-sm text-slate-500">Cada compra aumenta el stock y genera movimientos trazables.</p></CardHeader><CardContent>{physicalProducts.length === 0 ? <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">Primero crea un producto físico para poder registrar una compra.</p> : <PurchaseForm products={physicalProducts} />}</CardContent></Card><Card><CardHeader><h2 className="text-lg font-semibold text-slate-900">Historial de compras</h2><p className="mt-1 text-sm text-slate-500">Los detalles mantienen el precio pagado aunque el producto cambie después.</p></CardHeader><CardContent className="p-0"><PurchaseTable purchases={purchases} /></CardContent></Card></div></PageContainer>;
}