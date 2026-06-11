import { LoginForm } from "../src/presentation/components/auth/login-form";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 px-5 py-8 text-slate-900 sm:px-8 sm:py-12">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900 p-6 text-slate-100 shadow-2xl shadow-slate-950/50 sm:p-8">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-cyan-300/15 blur-3xl" />

          <p className="relative text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
            Admin Marcas
          </p>
          <h1 className="relative mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Control unificado para marcas, usuarios y reportes.
          </h1>
          <p className="relative mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Este panel centraliza operaciones del canal tradicional: acceso por roles, seguimiento
            de campanas y visibilidad operativa en tiempo real.
          </p>

          <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
            <article className="rounded-xl border border-slate-700 bg-slate-800/75 p-4">
              <h2 className="text-sm font-semibold text-white">Gobierno de usuarios</h2>
              <p className="mt-2 text-xs leading-6 text-slate-300">
                Gestion de permisos por perfil, auditoria de accesos y control de sesiones.
              </p>
            </article>
            <article className="rounded-xl border border-slate-700 bg-slate-800/75 p-4">
              <h2 className="text-sm font-semibold text-white">Operacion de marcas</h2>
              <p className="mt-2 text-xs leading-6 text-slate-300">
                Publicacion de iniciativas, seguimiento de cumplimiento y estados de campana.
              </p>
            </article>
            <article className="rounded-xl border border-slate-700 bg-slate-800/75 p-4">
              <h2 className="text-sm font-semibold text-white">Reportes accionables</h2>
              <p className="mt-2 text-xs leading-6 text-slate-300">
                Indicadores clave de adopcion, rendimiento de activaciones y trazabilidad.
              </p>
            </article>
            <article className="rounded-xl border border-slate-700 bg-slate-800/75 p-4">
              <h2 className="text-sm font-semibold text-white">Configuracion flexible</h2>
              <p className="mt-2 text-xs leading-6 text-slate-300">
                Parametros de negocio, catlogos dinamicos y reglas operativas centralizadas.
              </p>
            </article>
          </div>
        </section>

        <div className="self-start">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
