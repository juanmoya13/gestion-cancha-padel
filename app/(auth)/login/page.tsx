"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, TriangleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("No pudimos iniciar sesión. Revisa tus credenciales.");
      setIsPending(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#17221f] px-6 py-10 text-white sm:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-16 lg:grid-cols-[1fr_420px]">
        <section className="hidden max-w-xl lg:block">
          <p className="mb-8 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">Complejo de pádel</p>
          <h1 className="text-6xl font-semibold leading-[0.95] tracking-tight">El control de tu cancha, en una sola mirada.</h1>
          <p className="mt-8 max-w-md text-lg leading-8 text-slate-300">Ventas, inventario, jugadores y cuentas corrientes reunidos en un espacio operativo.</p>
          <div className="mt-16 h-1 w-24 bg-emerald-400" />
        </section>

        <section className="rounded-2xl bg-white p-8 text-[#17221f] shadow-2xl shadow-black/20 sm:p-10">
          <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <LockKeyhole size={22} aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Acceso administrador</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Bienvenido de nuevo</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">Ingresa con la cuenta autorizada para administrar el complejo.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-slate-700">
              Correo electrónico
              <input className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Contraseña
              <input className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
            </label>
            {error && <p className="flex items-center gap-2 text-sm text-red-600" role="alert"><TriangleAlert size={16} aria-hidden="true" />{error}</p>}
            <button className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isPending}>
              {isPending ? "Ingresando..." : "Ingresar al panel"}
              {!isPending && <ArrowRight size={18} aria-hidden="true" />}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}