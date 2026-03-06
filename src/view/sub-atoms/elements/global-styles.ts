// src/view/sub-atoms/elements/global-styles.ts
// All global CSS for the application, rendered inside the <style> tag in main-layout.

export function globalStyles(): string {
  return `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; color: #1a1a1a; background: #f5f5f5; }
    .main-nav { background: #1a1a2e; color: white; padding: 0 2rem; display: flex; align-items: center; gap: 2rem; height: 56px; }
    .main-nav__brand { font-weight: 700; font-size: 1.1rem; color: #e0b84a; text-decoration: none; }
    .main-nav__links { list-style: none; display: flex; gap: 1rem; }
    .nav-item a { color: #ccc; text-decoration: none; padding: 0.25rem 0.5rem; border-radius: 4px; }
    .nav-item--active a { color: white; background: rgba(255,255,255,0.1); }
    main { max-width: 1200px; margin: 2rem auto; padding: 0 2rem; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.5rem; }
    .btn { padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem; text-decoration: none; display: inline-block; }
    .btn--primary { background: #1a1a2e; color: white; }
    .btn--secondary { background: transparent; border: 1px solid #ccc; color: #333; }
    .btn--danger { background: #dc3545; color: white; }
    .btn--small { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
    .link { color: #1a1a2e; text-decoration: underline; }
    .data-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .data-table th { background: #f8f8f8; padding: 0.75rem 1rem; text-align: left; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: #666; }
    .data-table td { padding: 0.75rem 1rem; border-top: 1px solid #eee; }
    .actions { display: flex; gap: 0.5rem; align-items: center; }
    .record-count { color: #666; font-size: 0.9rem; margin-bottom: 0.75rem; }
    .empty-state { text-align: center; color: #666; padding: 3rem; background: white; border-radius: 8px; }
    .entity-form { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); max-width: 640px; }
    .form-field { margin-bottom: 1.25rem; }
    .form-field label { display: block; font-weight: 600; margin-bottom: 0.35rem; font-size: 0.9rem; }
    .form-field input, .form-field textarea, .form-field select { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
    .form-field textarea { min-height: 100px; resize: vertical; }
    .form-field--invalid input, .form-field--invalid textarea, .form-field--invalid select { border-color: #dc3545; }
    .field-error { display: block; color: #dc3545; font-size: 0.85rem; margin-top: 0.25rem; }
    .form-actions { display: flex; gap: 1rem; margin-top: 1.5rem; align-items: center; }
    .detail-list { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
    .detail-list__row { display: grid; grid-template-columns: 200px 1fr; padding: 0.75rem 1rem; border-top: 1px solid #eee; }
    .detail-list__row:first-child { border-top: none; }
    dt { font-weight: 600; color: #666; font-size: 0.9rem; }
    .badge { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.8rem; font-weight: 600; }
    .badge--active { background: #d4edda; color: #155724; }
    .badge--inactive { background: #f8d7da; color: #721c24; }

    /* Footer */
    .site-footer { background: #1a1a2e; color: #999; padding: 2rem; margin-top: 3rem; }
    .site-footer__inner { max-width: 1200px; margin: 0 auto; text-align: center; }
    .site-footer__brand { font-weight: 700; color: #e0b84a; margin-bottom: 0.25rem; }
    .site-footer__version { font-weight: 400; color: #666; font-size: 0.85rem; }
    .site-footer__arch { font-size: 0.85rem; }

    /* Home page */
    .hero { text-align: center; padding: 3rem 1rem; margin-bottom: 2rem; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .hero__title { font-size: 2.2rem; color: #1a1a2e; margin-bottom: 0.5rem; }
    .hero__subtitle { font-size: 1.1rem; color: #555; max-width: 600px; margin: 0 auto 0.75rem; line-height: 1.5; }
    .hero__tech { font-size: 0.9rem; color: #888; }
    .hero__tech strong { color: #1a1a2e; }

    .home-section { margin-bottom: 2.5rem; }
    .home-section__title { font-size: 1.25rem; margin-bottom: 1rem; color: #1a1a2e; }

    .entity-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
    .entity-card { display: flex; gap: 1rem; padding: 1.25rem; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-decoration: none; color: inherit; transition: box-shadow 0.2s, transform 0.2s; }
    .entity-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.12); transform: translateY(-2px); }
    .entity-card__icon { font-size: 2rem; line-height: 1; }
    .entity-card__name { font-weight: 700; font-size: 1rem; color: #1a1a2e; margin-bottom: 0.25rem; }
    .entity-card__desc { font-size: 0.85rem; color: #666; line-height: 1.4; margin-bottom: 0.5rem; }
    .entity-card__count { font-size: 0.8rem; color: #999; }

    .architecture-table-wrapper { max-width: 700px; }
    .layer-badge { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; font-size: 0.8rem; font-weight: 700; color: white; }
    .layer-badge--0 { background: #6c5ce7; }
    .layer-badge--1 { background: #0984e3; }
    .layer-badge--2 { background: #00b894; }
    .layer-badge--3 { background: #fdcb6e; color: #1a1a2e; }
    .layer-badge--4 { background: #e17055; }
    .layer-badge--5 { background: #d63031; }
    .layer-badge--6 { background: #1a1a2e; }

    .api-endpoints { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem; }
    .api-group { background: white; border-radius: 8px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .api-group__title { font-size: 0.9rem; font-weight: 700; margin-bottom: 0.75rem; color: #1a1a2e; }
    .api-group code { display: block; font-size: 0.82rem; padding: 0.3rem 0; color: #555; border-bottom: 1px solid #f0f0f0; }
    .api-group code:last-child { border-bottom: none; }

    /* Duplicate notice */
    .duplicate-notice { background: #fff3cd; color: #856404; border: 1px solid #ffeeba; border-radius: 6px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; max-width: 640px; font-size: 0.9rem; }

    /* Pagination */
    .pagination { display: flex; align-items: center; justify-content: space-between; margin-top: 1.25rem; padding: 0.75rem 0; }
    .pagination__info { font-size: 0.85rem; color: #666; }
    .pagination__links { display: flex; align-items: center; gap: 0.25rem; }
    .pagination__link { padding: 0.4rem 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.85rem; color: #333; text-decoration: none; cursor: pointer; transition: background 0.15s, border-color 0.15s; }
    .pagination__link:hover:not(.pagination__link--disabled):not(.pagination__link--active) { background: #f0f0f0; border-color: #bbb; }
    .pagination__link--active { background: #1a1a2e; color: white; border-color: #1a1a2e; font-weight: 600; }
    .pagination__link--disabled { color: #bbb; cursor: default; border-color: #eee; }
    .pagination__ellipsis { padding: 0.4rem 0.35rem; color: #999; font-size: 0.85rem; }`;
}
