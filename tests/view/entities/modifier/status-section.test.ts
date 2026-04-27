// tests/view/entities/item-modifier/status-section.test.ts
// Tests the P1 L5 view functions: statusFormSection and statusBadge.
// Both render HTML and both contain user-provided content that must be escaped.

import { describe, it, expect } from "bun:test";
import { statusFormSection } from "../../../../src/view/entities/modifier/status-form-section";
import { statusBadge } from "../../../../src/view/entities/modifier/status-badge";

// ── statusFormSection ──────────────────────────────────────────────────────────

describe("statusFormSection", () => {
  // ── Radio checked state ────────────────────────────────────────────────────

  it("checks the Active radio when currentState is 'active'", () => {
    const html = statusFormSection("active");
    // The active option must have checked; the others must not
    expect(html).toContain('value="active" checked');
    expect(html).not.toContain('value="disabled" checked');
    expect(html).not.toContain('value="archived" checked');
  });

  it("checks the Disabled radio when currentState is 'disabled'", () => {
    const html = statusFormSection("disabled");
    expect(html).toContain('value="disabled" checked');
    expect(html).not.toContain('value="active" checked');
    expect(html).not.toContain('value="archived" checked');
  });

  it("checks the Archived radio when currentState is 'archived'", () => {
    const html = statusFormSection("archived");
    expect(html).toContain('value="archived" checked');
    expect(html).not.toContain('value="active" checked');
    expect(html).not.toContain('value="disabled" checked');
  });

  // ── Reason textarea ────────────────────────────────────────────────────────

  it("renders the reason textarea with an empty value when reasonValue is undefined", () => {
    const html = statusFormSection("active");
    expect(html).toContain("<textarea");
    expect(html).toContain("</textarea>");
    // The textarea content between the tags should be empty
    expect(html).toMatch(/<textarea[^>]*><\/textarea>/);
  });

  it("renders the reason value inside the textarea", () => {
    const html = statusFormSection("archived", "Content power-crept");
    expect(html).toContain("Content power-crept");
  });

  // ── XSS — reasonValue must be escaped ─────────────────────────────────────

  it("escapes HTML in the reasonValue", () => {
    const html = statusFormSection("archived", '<script>alert("xss")</script>');
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&quot;xss&quot;");
  });

  // ── Structure ─────────────────────────────────────────────────────────────

  it("renders all three radio options regardless of currentState", () => {
    const html = statusFormSection("active");
    expect(html).toContain('value="active"');
    expect(html).toContain('value="disabled"');
    expect(html).toContain('value="archived"');
  });

  it("uses name='status_action' on all radios (L2 reads this field)", () => {
    const html = statusFormSection("active");
    // Count occurrences — three radios, all with the same name
    const matches = html.match(/name="status_action"/g);
    expect(matches).toHaveLength(3);
  });
});

// ── statusBadge ────────────────────────────────────────────────────────────────

describe("statusBadge", () => {
  // ── State priority ─────────────────────────────────────────────────────────
  // archivedAt wins over isActive — an archived item may still have is_active=false;
  // the archived state takes priority because archivedAt is the definitive signal.

  it("shows 'Archived' when archivedAt is provided, regardless of isActive", () => {
    const html = statusBadge(true, "2024-01-15T10:00:00Z");
    expect(html).toContain("Archived");
    expect(html).toContain("status-dot--archived");
    expect(html).not.toContain("Active");
    expect(html).not.toContain("Disabled");
  });

  it("shows 'Disabled' when isActive is false and archivedAt is absent", () => {
    const html = statusBadge(false);
    expect(html).toContain("Disabled");
    expect(html).toContain("status-dot--inactive");
    expect(html).not.toContain("Active");
    expect(html).not.toContain("Archived");
  });

  it("shows 'Active' when isActive is true and archivedAt is absent", () => {
    const html = statusBadge(true);
    expect(html).toContain("Active");
    expect(html).toContain("status-dot--active");
    expect(html).not.toContain("Disabled");
    expect(html).not.toContain("Archived");
  });

  // ── Archive reason ─────────────────────────────────────────────────────────

  it("renders the archive reason text when archivedReason is provided", () => {
    const html = statusBadge(false, "2024-01-15T10:00:00Z", "Content outdated");
    expect(html).toContain("Content outdated");
  });

  it("omits the reason block when archivedReason is not provided", () => {
    const html = statusBadge(false, "2024-01-15T10:00:00Z");
    expect(html).not.toContain("Reason:");
  });

  // ── XSS — archivedReason must be escaped ──────────────────────────────────

  it("escapes HTML in the archive reason", () => {
    const html = statusBadge(false, "2024-01-15T10:00:00Z", '<img/onerror=alert(1)>');
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });
});
