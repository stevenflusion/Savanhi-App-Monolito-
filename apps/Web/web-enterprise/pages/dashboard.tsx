"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../src/presentation/components/auth/auth-provider";

export default function DashboardPage() {
  const router = useRouter();
  const { user, session, isReady } = useAuth();

  useEffect(() => {
    if (isReady && (!session || !user)) {
      router.replace("/");
    }
  }, [isReady, session, user, router]);

  if (!isReady || !session || !user) {
    return (
      <main className="min-h-screen bg-slate-950 px-5 py-8 text-slate-100">
        <div className="mx-auto max-w-6xl">Validando sesion...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-8 text-slate-100 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/50">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
            Admin Marcas
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Vista inicial de operacion para seguimiento de usuarios, marcas, campanas y reportes.
          </p>
          <p className="mt-3 text-sm text-emerald-300">
            Sesion activa: {user.fullName} ({user.role})
          </p>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs text-slate-400">Usuarios activos</p>
            <p className="mt-2 text-2xl font-bold text-white">128</p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs text-slate-400">Marcas vigentes</p>
            <p className="mt-2 text-2xl font-bold text-white">34</p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs text-slate-400">Campanas activas</p>
            <p className="mt-2 text-2xl font-bold text-white">12</p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs text-slate-400">Alertas abiertas</p>
            <p className="mt-2 text-2xl font-bold text-amber-300">5</p>
          </article>
        </section>
      </div>
    </main>
  );
}
