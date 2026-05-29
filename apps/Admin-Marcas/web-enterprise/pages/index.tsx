import React from 'react';

export default function Home() {
  return (
    <main style={{ fontFamily: 'sans-serif', padding: 32 }}>
      <h1 style={{ color: '#2d3748' }}>Panel de Administración</h1>
      <section style={{ marginTop: 24 }}>
        <h2>Bienvenido a Admin-Marcas Web Enterprise</h2>
        <p>
          Aquí podrás gestionar usuarios, marcas, reportes y mucho más.
        </p>
        <ul>
          <li>Gestión de usuarios</li>
          <li>Gestión de marcas</li>
          <li>Reportes y estadísticas</li>
          <li>Configuración avanzada</li>
        </ul>
      </section>
    </main>
  );
}
