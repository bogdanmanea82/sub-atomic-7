// src/view/atoms/components/pagination-controls.ts
// Renders page navigation links for paginated list views

import type { PaginationMeta } from "@view-service/types";

/**
 * Builds the href for a given page number, preserving the base path.
 * Page 1 uses the bare path (no ?page= param) for clean URLs.
 */
function pageUrl(basePath: string, page: number): string {
  if (page === 1) return basePath;
  const separator = basePath.includes("?") ? "&" : "?";
  return `${basePath}${separator}page=${page}`;
}

/**
 * Generates a window of page numbers around the current page.
 * Shows at most 7 page links: first, last, current, and neighbors.
 */
function pageWindow(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    pages.add(i);
  }

  return Array.from(pages).sort((a, b) => a - b);
}

/**
 * Renders pagination controls: Previous, page numbers, Next.
 * Returns empty string when there's only one page (no controls needed).
 */
export function paginationControls(
  pagination: PaginationMeta,
  basePath: string,
): string {
  if (pagination.totalPages <= 1) return "";

  const pages = pageWindow(pagination.currentPage, pagination.totalPages);

  const prevLink = pagination.hasPrev
    ? `<a href="${pageUrl(basePath, pagination.currentPage - 1)}" class="pagination__link">&laquo; Previous</a>`
    : `<span class="pagination__link pagination__link--disabled">&laquo; Previous</span>`;

  const nextLink = pagination.hasNext
    ? `<a href="${pageUrl(basePath, pagination.currentPage + 1)}" class="pagination__link">Next &raquo;</a>`
    : `<span class="pagination__link pagination__link--disabled">Next &raquo;</span>`;

  let pageLinks = "";
  let lastPage = 0;
  for (const page of pages) {
    if (lastPage > 0 && page - lastPage > 1) {
      pageLinks += `<span class="pagination__ellipsis">&hellip;</span>`;
    }
    if (page === pagination.currentPage) {
      pageLinks += `<span class="pagination__link pagination__link--active">${page}</span>`;
    } else {
      pageLinks += `<a href="${pageUrl(basePath, page)}" class="pagination__link">${page}</a>`;
    }
    lastPage = page;
  }

  const startRecord = (pagination.currentPage - 1) * pagination.pageSize + 1;
  const endRecord = Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount);

  return `
    <nav class="pagination" aria-label="Page navigation">
      <div class="pagination__info">
        Showing ${startRecord}–${endRecord} of ${pagination.totalCount} records
      </div>
      <div class="pagination__links">
        ${prevLink}
        ${pageLinks}
        ${nextLink}
      </div>
    </nav>`;
}
