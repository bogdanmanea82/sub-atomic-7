// src/view/organisms/pages/home-page.ts
// Landing page — project overview, architecture summary, and entity navigation cards.

import { mainLayout } from "../layouts";

/** One entity card on the home page. */
export interface EntityCardData {
  readonly name: string;
  readonly description: string;
  readonly href: string;
  readonly count: number;
  readonly icon: string;
}

function entityCard(card: EntityCardData): string {
  return `
    <a href="${card.href}" class="entity-card">
      <div class="entity-card__icon">${card.icon}</div>
      <div class="entity-card__body">
        <h3 class="entity-card__name">${card.name}</h3>
        <p class="entity-card__desc">${card.description}</p>
        <span class="entity-card__count">${card.count} record${card.count === 1 ? "" : "s"}</span>
      </div>
    </a>`;
}

function layerRow(number: number, name: string, description: string): string {
  return `
    <tr>
      <td><span class="layer-badge layer-badge--${number}">${number}</span></td>
      <td>${name}</td>
      <td>${description}</td>
    </tr>`;
}

/**
 * Renders the home page with a hero section, entity navigation cards,
 * and an architecture overview.
 */
export function homePage(entities: readonly EntityCardData[]): string {
  const content = `
    <div class="main--home">
    <section class="hero">
      <h1 class="hero__title">RPG CMS</h1>
      <p class="hero__subtitle">Entity-driven content management with sub-atomic composition and seven-layer architecture.</p>
      <p class="hero__tech">Built with <strong>Bun</strong> + <strong>ElysiaJS</strong> + <strong>PostgreSQL</strong> + <strong>TypeScript</strong></p>
    </section>

    <section class="home-section">
      <h2 class="home-section__title">Entities</h2>
      <div class="entity-grid">
        ${entities.map((e) => entityCard(e)).join("")}
      </div>
    </section>

    <section class="home-section">
      <h2 class="home-section__title">Architecture</h2>
      <div class="architecture-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Layer</th>
              <th>Name</th>
              <th>Responsibility</th>
            </tr>
          </thead>
          <tbody>
            ${layerRow(0, "Configuration", "Pure data — field configs, entity specs, constraints")}
            ${layerRow(1, "Model", "Validation, serialization, query building")}
            ${layerRow(2, "Model Service", "Database access, business workflows, transactions")}
            ${layerRow(3, "Controller", "HTTP handling — routes, request/response, middleware")}
            ${layerRow(4, "View Service", "Display preparation — formatting, view model assembly")}
            ${layerRow(5, "View", "HTML rendering — template literals, pages, layouts")}
            ${layerRow(6, "Browser", "Client-side — validation, events, interactive UI")}
          </tbody>
        </table>
      </div>
    </section>

    <section class="home-section">
      <h2 class="home-section__title">API</h2>
      <div class="api-endpoints">
        <div class="api-group">
          <h3 class="api-group__title">JSON API</h3>
          <code>GET /api/game-domains</code>
          <code>GET /api/game-domains/:id</code>
          <code>POST /api/game-domains</code>
          <code>PUT /api/game-domains/:id</code>
          <code>DELETE /api/game-domains/:id</code>
        </div>
        <div class="api-group">
          <h3 class="api-group__title">HTML Pages</h3>
          <code>GET /game-domains</code>
          <code>GET /game-domains/:id</code>
          <code>GET /game-domains/new</code>
          <code>GET /game-domains/:id/edit</code>
        </div>
        <div class="api-group">
          <h3 class="api-group__title">System</h3>
          <code>GET /</code>
          <code>GET /health</code>
        </div>
      </div>
    </section>
    </div>`;

  return mainLayout(content, "Home", "/");
}
