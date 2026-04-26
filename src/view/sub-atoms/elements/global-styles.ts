// src/view/sub-atoms/elements/global-styles.ts
// All global CSS for the application, rendered inside the <style> tag in main-layout.

export function globalStyles(): string {
  return `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; color: #1a1a1a; background: #f5f5f5; }
    .main-nav { background: #1a1a2e; color: white; padding: 0 2rem; display: flex; align-items: center; gap: 2rem; height: 48px; }
    .main-nav__brand { font-weight: 700; font-size: 1.1rem; color: #e0b84a; text-decoration: none; }
    .main-nav__links { list-style: none; display: flex; gap: 0.25rem; align-items: center; }
    .nav-item > a { color: #ccc; text-decoration: none; padding: 0.25rem 0.5rem; border-radius: 4px; display: inline-block; }
    .nav-item > a:hover { color: white; background: rgba(255,255,255,0.08); }
    .nav-item--active > a { color: white; background: rgba(255,255,255,0.1); }
    .nav-item { position: relative; list-style: none; }
    .nav-item__trigger { color: #ccc; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: default; user-select: none; display: flex; align-items: center; gap: 0.25rem; font-size: 0.9rem; white-space: nowrap; }
    .nav-item--has-dropdown:hover .nav-item__trigger { color: white; background: rgba(255,255,255,0.08); }
    .nav-item--active .nav-item__trigger { color: white; background: rgba(255,255,255,0.1); }
    .nav-item__caret { font-size: 0.65rem; opacity: 0.7; }
    .nav-item__dropdown { display: none; position: absolute; top: 100%; left: 0; background: #1a1a2e; border: 1px solid rgba(255,255,255,0.12); border-radius: 6px; min-width: 180px; z-index: 200; padding: 0.35rem 0; padding-top: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.4); list-style: none; }
    .nav-item--has-dropdown:hover .nav-item__dropdown { display: block; }
    .nav-item__dropdown li { list-style: none; }
    .nav-item__dropdown a { display: block; padding: 0.45rem 0.9rem; color: #ccc; text-decoration: none; font-size: 0.9rem; white-space: nowrap; }
    .nav-item__dropdown a:hover { background: rgba(255,255,255,0.08); color: white; }
    main { margin: 2rem auto; padding: 0 2rem; }
    .main--home { max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header__title-row { display: flex; align-items: center; justify-content: space-between; }
    .page-header__actions { display: flex; gap: 0.5rem; align-items: center; }
    .page-header h1 { font-size: 1.5rem; }
    .breadcrumb { font-size: 0.85rem; color: #888; margin-bottom: 0.35rem; }
    .breadcrumb a { color: #666; text-decoration: none; }
    .breadcrumb a:hover { text-decoration: underline; color: #1a1a2e; }
    .breadcrumb__sep { margin: 0 0.25rem; color: #ccc; }
    .btn { padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem; text-decoration: none; display: inline-block; }
    .btn--primary { background: #1a1a2e; color: white; }
    .btn--secondary { background: transparent; border: 1px solid #ccc; color: #333; }
    .btn--danger { background: #dc3545; color: white; }
    .btn--small { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
    .link { color: #1a1a2e; text-decoration: underline; }
    .link--icon-only { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 4px; text-decoration: none; font-size: 1.1rem; color: #666; transition: background 0.15s, color 0.15s; }
    .link--icon-only:hover { background: #f0f0f0; color: #333; }
    .link--danger.link--icon-only:hover { background: #fee; color: #dc3545; }
    button.link--icon-only { border: none; background: none; cursor: pointer; padding: 0; font-size: 1.1rem; color: #666; }
    button.link--icon-only:hover { background: #fee; color: #dc3545; }
    .data-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .data-table th { background: #f8f8f8; padding: 0.5rem 0.75rem; text-align: left; font-size: 0.85rem; font-weight: 600; color: #666; }
    .data-table td { padding: 0.5rem 0.75rem; border-top: 1px solid #eee; }
    .data-table thead th { position: sticky; top: 0; z-index: 1; }
    .data-table tbody tr:hover { background: #f8f9fa; }
    .data-table tbody tr:nth-child(even) { background: #fafafa; }
    .data-table tbody tr:nth-child(even):hover { background: #f0f2f4; }
    td[data-field="code"] { font-family: "SF Mono", "Fira Code", ui-monospace, monospace; font-size: 0.85em; }
    .actions { display: flex; gap: 0.5rem; align-items: center; }
    .record-count { color: #666; font-size: 0.9rem; margin-bottom: 0.75rem; }
    .list-toolbar { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
    .list-toolbar .search-input { flex: 1; max-width: 480px; }
    .list-toolbar .btn--primary { font-size: 1.2rem; padding: 0.35rem 0.75rem; line-height: 1; }
    .empty-state { text-align: center; color: #666; padding: 3rem; background: white; border-radius: 8px; }
    .entity-form { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); max-width: 640px; }
    .form-field { margin-bottom: 1.25rem; }
    .form-field label { display: block; font-weight: 600; margin-bottom: 0.35rem; font-size: 0.9rem; }
    .form-field input, .form-field textarea, .form-field select { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
    .form-field textarea { min-height: 100px; resize: vertical; }
    .form-field--invalid input, .form-field--invalid textarea, .form-field--invalid select { border-color: #dc3545; }
    .field-error { display: block; color: #dc3545; font-size: 0.85rem; margin-top: 0.25rem; }
    .form-actions { display: flex; gap: 1rem; margin-top: 1.5rem; align-items: center; }
    .detail-list { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; max-width: 1100px; }
    .detail-list--two-col { display: grid; grid-template-columns: 1fr 1fr; }
    .detail-list__row { display: grid; grid-template-columns: 180px 1fr; padding: 0.6rem 1rem; border-top: 1px solid #eee; }
    .detail-list__row:first-child, .detail-list--two-col .detail-list__row:nth-child(2) { border-top: none; }
    .detail-footer { font-size: 0.8rem; color: #999; margin-top: 0.75rem; max-width: 1100px; }
    dt { font-weight: 500; color: #888; font-size: 0.9rem; }
    .status-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; }
    .status-dot--active { background: #28a745; }
    .status-dot--inactive { background: #dc3545; }
    .status-dot--reactivated { background: #007bff; }
    .status-dot--archived { background: #ffc107; margin-left: 4px; }
    .lifecycle-dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 0.5rem; }
    .lifecycle-dot.lifecycle--active { background: #28a745; }
    .lifecycle-dot.lifecycle--deactivated { background: #dc3545; }
    .lifecycle-dot.lifecycle--reactivated { background: #007bff; }
    .lifecycle-dot.lifecycle--archived { background: #ffc107; }
    .lifecycle-label { font-weight: 600; font-size: 0.95rem; }
    .lifecycle-label.lifecycle--active { color: #155724; }
    .lifecycle-label.lifecycle--deactivated { color: #721c24; }
    .lifecycle-label.lifecycle--reactivated { color: #004085; }
    .lifecycle-label.lifecycle--archived { color: #856404; }
    .status-section { margin-bottom: 1.5rem; max-width: 1100px; }
    .status-section--form { border: 1px solid #dee2e6; border-radius: 8px; padding: 1.25rem; background: white; }
    .status-section--form legend { font-weight: 600; font-size: 1rem; padding: 0 0.5rem; }
    .status-section__heading { font-size: 1rem; font-weight: 600; margin-bottom: 0.75rem; }
    .status-section__signal { display: flex; align-items: center; margin-bottom: 0.5rem; }
    .status-section__archive { margin-top: 0.5rem; padding: 0.5rem 0.75rem; background: #fff3cd; border-radius: 4px; font-size: 0.85rem; }
    .status-section__archive-label { font-weight: 500; color: #856404; }
    .status-section__archive-reason { color: #856404; margin-top: 0.25rem; }
    .status-section__field { margin-bottom: 1rem; }
    .status-section__field:last-child { margin-bottom: 0; }
    .status-section__field label { display: block; font-weight: 600; margin-bottom: 0.35rem; font-size: 0.9rem; }
    .status-section__field textarea { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; font-family: inherit; font-size: 0.9rem; resize: vertical; }
    .status-options { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
    .status-option { display: flex; align-items: center; gap: 0.4rem; cursor: pointer; padding: 0.5rem 1rem; border: 1px solid #ddd; border-radius: 6px; transition: all 0.15s; opacity: 0.5; }
    .status-option:has(input:checked) { opacity: 1; border-color: #1a1a2e; background: #f0f2f5; }
    .status-option input[type="radio"] { margin: 0; }
    .status-option__label { font-weight: 500; font-size: 0.9rem; }
    .status-reason-wrap { display: none; margin-top: 0.5rem; }
    .status-section--form:has(input[value="disabled"]:checked) .status-reason-wrap,
    .status-section--form:has(input[value="archived"]:checked) .status-reason-wrap { display: block; }
    .status-reason-wrap label { display: block; font-weight: 600; margin-bottom: 0.35rem; font-size: 0.9rem; }
    .status-reason-wrap textarea { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; font-family: inherit; font-size: 0.9rem; resize: vertical; }
    .status-section__hint { font-size: 0.8rem; color: #888; margin-top: 0.25rem; }
    .data-table--compact { width: auto; min-width: 50%; }
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
    .hero { text-align: center; padding: 1.5rem 1rem; margin-bottom: 2rem; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
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
    .entity-card__count { font-size: 1.1rem; font-weight: 700; color: #1a1a2e; }

    .architecture-table-wrapper { max-width: none; }
    .layer-badge { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; font-size: 0.8rem; font-weight: 700; color: white; }
    .layer-badge--0 { background: #6c5ce7; }
    .layer-badge--1 { background: #0984e3; }
    .layer-badge--2 { background: #00b894; }
    .layer-badge--3 { background: #fdcb6e; color: #1a1a2e; }
    .layer-badge--4 { background: #e17055; }
    .layer-badge--5 { background: #d63031; }
    .layer-badge--6 { background: #1a1a2e; }

    .api-endpoints { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
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
    .pagination__ellipsis { padding: 0.4rem 0.35rem; color: #999; font-size: 0.85rem; }

    /* Tab bar + tab panels */
    .tab-bar { display: flex; gap: 0; border-bottom: 2px solid var(--border-color, #e0e0e0); margin-bottom: 1.5rem; max-width: 1100px; }
    .tab-bar__tab { padding: 0.6rem 1.2rem; border: none; background: none; cursor: pointer; font-size: 0.9rem; color: #666; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: color 0.15s, border-color 0.15s; }
    .tab-bar__tab:hover { color: #333; }
    .tab-bar__tab--active { color: var(--text-primary, #1a1a2e); border-bottom-color: var(--text-primary, #1a1a2e); font-weight: 600; }
    .tab-bar__tab--disabled { color: #bbb; cursor: default; }
    .tab-bar__tab--disabled:hover { color: #bbb; }
    .tab-panel { max-width: 1100px; }
    .tab-placeholder { color: #999; font-style: italic; padding: 2rem 0; }

    /* Binding panel */
    .binding-panel { display: flex; flex-direction: column; gap: 2rem; }
    .binding-section h3 { font-size: 1rem; margin-bottom: 0.75rem; color: #1a1a2e; }
    .binding-empty { color: #999; font-style: italic; padding: 1rem 0; }
    .binding-table { font-size: 0.9rem; }

    /* Assignment panel (Screen 3) */
    .assignment-panel__description { color: #666; font-size: 0.9rem; margin-bottom: 1.25rem; line-height: 1.5; }
    .assignment-summary { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
    .assignment-summary__stat { background: white; border-radius: 8px; padding: 0.75rem 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; min-width: 90px; }
    .assignment-summary__count { display: block; font-size: 1.5rem; font-weight: 700; line-height: 1.2; }
    .assignment-summary__label { display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #666; margin-top: 0.2rem; }
    .assignment-summary__stat--eligible .assignment-summary__count { color: #155724; }
    .assignment-summary__stat--excluded .assignment-summary__count { color: #721c24; }
    .assignment-summary__stat--none .assignment-summary__count { color: #999; }
    .assignment-summary__stat--total .assignment-summary__count { color: #1a1a2e; }
    .assignment-group { margin-bottom: 1.5rem; }
    .assignment-group__header { font-size: 0.95rem; font-weight: 600; color: #1a1a2e; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
    .assignment-table { font-size: 0.9rem; }
    .assignment-row--none td { color: #999; }
    .assignment-empty { color: #999; font-style: italic; padding: 0.5rem 0; font-size: 0.9rem; }
    .assignment-source { font-size: 0.75rem; font-weight: 500; padding: 0.15rem 0.5rem; border-radius: 4px; }
    .assignment-source--explicit { background: #e8f0fe; color: #1a73e8; }
    .assignment-source--inherited { background: #f0f0f0; color: #666; }
    .badge--muted { background: #f0f0f0; color: #999; }
    .badge--small { font-size: 0.7rem; padding: 0.1rem 0.4rem; }

    /* Filter bar */
    .filter-bar { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .filter-bar select { padding: 0.4rem 0.6rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.85rem; background: white; min-width: 160px; }
    .filter-bar select:focus { border-color: #1a1a2e; outline: none; }

    /* Lifecycle summary table (detail page status section) */
    .lifecycle-table { margin-top: 0.25rem; }
    .lifecycle-table th { font-size: 0.8rem; }
    .lifecycle-table td { font-size: 0.85rem; padding: 0.35rem 0.75rem; }
    .lifecycle-row--dim td { color: #bbb; }

    /* Additional status dot variants for dominant status */
    .status-dot--modified { background: #6c757d; }
    .status-dot--renamed { background: #e83e8c; }

    /* History table icons */
    .history-icon { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; font-size: 0.75rem; font-weight: 700; }
    .history-icon--created { background: #d4edda; color: #155724; }
    .history-icon--updated { background: #e9ecef; color: #666; }
    .history-icon--deactivated { background: #f8d7da; color: #721c24; }
    .history-icon--reactivated { background: #cce5ff; color: #004085; }
    .history-icon--archived { background: #fff3cd; color: #856404; }
    .history-icon--deleted { background: #f8d7da; color: #721c24; }
    .history-icon--renamed { background: #fce4ec; color: #ad1457; }
    .history-table td:first-child { width: 30px; text-align: center; }`;
}
