<template>
  <div class="container page-about">
    <div class="about-card glass-card animate-fade-in">
      <div class="about-header">
        <div class="about-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <h1 class="about-title">Sobre SkyFlow Terminal</h1>
        <p class="about-subtitle">Sistema inteligente de visualización y reserva de operaciones aéreas.</p>
      </div>

      <div class="about-body">
        <section class="about-section">
          <h3>La Arquitectura del Sistema</h3>
          <p>Esta aplicación frontend ha sido construida utilizando una arquitectura desacoplada basada en módulos de Vue 3, priorizando la mantenibilidad, escalabilidad y una experiencia de usuario fluida.</p>
          
          <div class="tech-stack-grid">
            <div class="tech-item glass-card">
              <span class="tech-icon vue">V</span>
              <h4>Vue 3 (Composition API)</h4>
              <p>Lógica estructurada y reactividad moderna con <code>&lt;script setup&gt;</code>.</p>
            </div>
            <div class="tech-item glass-card">
              <span class="tech-icon router">R</span>
              <h4>Vue Router</h4>
              <p>Navegación fluida de una sola página (SPA) sin recargas del navegador.</p>
            </div>
            <div class="tech-item glass-card">
              <span class="tech-icon pinia">P</span>
              <h4>Pinia Store</h4>
              <p>Almacenamiento global centralizado para gestionar las reservas y configuraciones del sistema.</p>
            </div>
            <div class="tech-item glass-card">
              <span class="tech-icon styles">C</span>
              <h4>Vanilla CSS Premium</h4>
              <p>Estilos totalmente personalizados basados en variables CSS, flexbox/grids y glassmorfismo premium.</p>
            </div>
          </div>
        </section>

        <section class="about-section info-section">
          <h3>Estructura del Proyecto</h3>
          <p>El código sigue estrictamente la arquitectura modular requerida para la materia:</p>
          <ul class="structure-list">
            <li><strong>src/assets/</strong>: Hojas de estilos globales y recursos vectoriales limpios.</li>
            <li><strong>src/components/</strong>: Componentes UI atómicos e interactivos (Tarjetas de vuelo, Navbar, Botones).</li>
            <li><strong>src/composables/</strong>: Abstracción de lógica reactiva de negocio y mock de datos de la API.</li>
            <li><strong>src/router/</strong>: Enrutamiento seguro y mapeo de vistas principales.</li>
            <li><strong>src/stores/</strong>: Control de estado global con Pinia para la sesión de usuario.</li>
            <li><strong>src/views/</strong>: Páginas y contenedores de rutas principales.</li>
          </ul>
        </section>

        <footer class="about-footer">
          <div class="academic-info">
            <p><strong>ITLA - Instituto Tecnológico de Las Américas</strong></p>
            <p>Materia: Programación II</p>
            <p class="copyright">&copy; 2026 Terminal SkyFlow. Todos los derechos reservados.</p>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-about {
  padding: 1rem 0;
}

.about-card {
  max-width: 800px;
  margin: 0 auto;
  padding: 2.5rem;
}

.about-header {
  text-align: center;
  margin-bottom: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.about-icon {
  width: 56px;
  height: 56px;
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-primary);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.about-icon svg {
  width: 32px;
  height: 32px;
}

.about-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.02em;
}

.about-subtitle {
  color: var(--color-text-secondary);
  font-size: 1rem;
  margin-top: 0.35rem;
}

.about-body {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.about-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1rem;
}

.about-section p {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

/* Tech Grid */
.tech-stack-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-top: 1.5rem;
}

.tech-item {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  border-color: rgba(255, 255, 255, 0.05);
}

.tech-item:hover {
  transform: translateY(-2px);
}

.tech-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  color: white;
}

.tech-icon.vue { background-color: #41b883; }
.tech-icon.router { background-color: #42b983; }
.tech-icon.pinia { background-color: #ffd859; color: #1a1a1a; }
.tech-icon.styles { background-color: #3b82f6; }

.tech-item h4 {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.tech-item p {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

/* Structure list */
.structure-list {
  list-style: none;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.structure-list li {
  color: var(--color-text-secondary);
  position: relative;
  padding-left: 1.5rem;
}

.structure-list li::before {
  content: '📁';
  position: absolute;
  left: 0;
  top: 0;
}

.structure-list li strong {
  color: white;
}

.about-footer {
  border-top: 1px solid var(--color-border);
  padding-top: 1.5rem;
  margin-top: 1rem;
  text-align: center;
}

.academic-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.copyright {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-top: 0.5rem;
}

@media (max-width: 640px) {
  .about-card {
    padding: 1.5rem;
  }
}
</style>
