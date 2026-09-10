import { ProductForm } from "@/features/products/components/product-form";
import { ProductTable } from "@/features/products/components/product-table";
import { getActiveProducts } from "@/features/products/queries";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageContainer } from "@/components/layout/page-container";

export default async function ProductsPage() {
  const products = await getActiveProducts();
  return <PageContainer><div className="mb-8"><p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Catálogo e inventario</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Productos</h1><p className="mt-2 text-slate-500">Administra precios, unidades y servicios de alquiler sin perder el historial.</p></div><div className="grid gap-6 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.6fr)]"><Card><CardHeader><h2 className="text-lg font-semibold text-slate-900">Nuevo producto</h2><p className="mt-1 text-sm text-slate-500">El stock inicial genera su movimiento trazable.</p></CardHeader><CardContent><ProductForm /></CardContent></Card><ProductTable products={products} /></div></PageContainer>;
}