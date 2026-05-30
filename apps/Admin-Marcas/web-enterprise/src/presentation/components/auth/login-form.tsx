"use client";

import { FormEvent } from "react";
import { useLoginForm } from "../../hooks/use-login-form";

function inputClassName(hasError: boolean): string {
  const base =
    "w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition";
  const focus = "focus:ring-2 focus:ring-offset-1";

  if (hasError) {
    return `${base} border-rose-300 focus:border-rose-500 focus:ring-rose-200`;
  }

  return `${base} border-slate-300 focus:border-slate-500 focus:ring-slate-200 ${focus}`;
}

export function LoginForm() {
  const { credentials, errors, status, message, canSubmit, onChange, onSubmit } = useLoginForm();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    await onSubmit();
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/80">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Acceso seguro
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Iniciar sesion
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Usa tu cuenta para entrar al panel de administracion de marcas.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Correo</span>
          <input
            autoComplete="email"
            className={inputClassName(Boolean(errors.email))}
            onChange={(event) => onChange("email", event.target.value)}
            placeholder="admin@savanhi.com"
            type="email"
            value={credentials.email}
          />
          {errors.email ? <p className="mt-1 text-xs text-rose-600">{errors.email}</p> : null}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Contrasena</span>
          <input
            autoComplete="current-password"
            className={inputClassName(Boolean(errors.password))}
            onChange={(event) => onChange("password", event.target.value)}
            placeholder="Minimo 8 caracteres"
            type="password"
            value={credentials.password}
          />
          {errors.password ? (
            <p className="mt-1 text-xs text-rose-600">{errors.password}</p>
          ) : null}
        </label>

        <button
          className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={!canSubmit}
          type="submit"
        >
          {status === "submitting" ? "Validando..." : "Entrar"}
        </button>
      </form>

      {message ? (
        <p
          className={`mt-4 rounded-lg px-3 py-2 text-sm ${
            status === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {message}
        </p>
      ) : null}

      <p className="mt-4 text-xs text-slate-500">
        Demo: <span className="font-medium text-slate-700">admin@savanhi.com / Admin123!</span>
      </p>
    </section>
  );
}
