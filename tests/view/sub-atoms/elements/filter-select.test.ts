// tests/view/sub-atoms/elements/filter-select.test.ts
// Verifies HTML structure, option rendering, selection state, and XSS escaping.

import { describe, it, expect } from "bun:test";
import { filterSelect } from "../../../../src/view/sub-atoms/elements/filter-select";
import type { SelectOption } from "../../../../src/view-service/types";

const options: SelectOption[] = [
  { value: "aaa-111", label: "Domain A" },
  { value: "bbb-222", label: "Domain B" },
];

describe("filterSelect", () => {
  // ── Structure ─────────────────────────────────────────────────────────────

  it("renders a <select> element", () => {
    const html = filterSelect("game_domain_id", "All Domains", options);
    expect(html).toContain("<select");
    expect(html).toContain("</select>");
  });

  it("sets name attribute to the given name", () => {
    const html = filterSelect("game_domain_id", "All Domains", options);
    expect(html).toContain('name="game_domain_id"');
  });

  it("sets id attribute to filter_<name>", () => {
    const html = filterSelect("game_domain_id", "All Domains", options);
    expect(html).toContain('id="filter_game_domain_id"');
  });

  // ── Placeholder empty option ──────────────────────────────────────────────

  it("always prepends an empty option with the placeholder text", () => {
    const html = filterSelect("game_domain_id", "All Domains", options);
    expect(html).toContain('<option value="">All Domains</option>');
  });

  it("renders the empty option even when no options are provided", () => {
    const html = filterSelect("game_domain_id", "— Select —", []);
    expect(html).toContain('<option value="">— Select —</option>');
  });

  // ── Options ───────────────────────────────────────────────────────────────

  it("renders an <option> for each item in the options array", () => {
    const html = filterSelect("game_domain_id", "All Domains", options);
    expect(html).toContain('value="aaa-111"');
    expect(html).toContain(">Domain A<");
    expect(html).toContain('value="bbb-222"');
    expect(html).toContain(">Domain B<");
  });

  // ── Selected state ────────────────────────────────────────────────────────

  it("marks the matching option as selected when selectedValue is provided", () => {
    const html = filterSelect("game_domain_id", "All Domains", options, "aaa-111");
    expect(html).toContain('value="aaa-111" selected');
    // The non-matching option must NOT be selected
    expect(html).not.toContain('value="bbb-222" selected');
  });

  it("does not mark any option selected when selectedValue is undefined", () => {
    const html = filterSelect("game_domain_id", "All Domains", options, undefined);
    expect(html).not.toContain(" selected");
  });

  it("does not mark any option selected when selectedValue matches no option", () => {
    const html = filterSelect("game_domain_id", "All Domains", options, "zzz-999");
    expect(html).not.toContain(" selected");
  });

  // ── XSS escaping ──────────────────────────────────────────────────────────

  it("escapes HTML in option labels", () => {
    const dangerous: SelectOption[] = [{ value: "safe-id", label: '<script>alert(1)</script>' }];
    const html = filterSelect("field", "Pick", dangerous);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("escapes HTML in option values — breaks attribute-escape injection", () => {
    // The attack is: value ends with `"` to close the attribute, then injects a tag.
    // escapeHtml converts `"` → `&quot;` so the attribute boundary is never broken.
    const dangerous: SelectOption[] = [{ value: '"><img/onerror=alert(1)>', label: "Payload" }];
    const html = filterSelect("field", "Pick", dangerous);
    // The `"` that would close the value="" attribute must be escaped
    expect(html).toContain("&quot;");
    // The `<` that would open the img tag must be escaped
    expect(html).not.toContain("<img");
    // The `>` that would close a potential tag must be escaped in the value
    expect(html).toContain("&gt;");
  });

  it("escapes HTML in the placeholder text", () => {
    const html = filterSelect("field", '<b>Bold</b>', []);
    expect(html).not.toContain("<b>");
    expect(html).toContain("&lt;b&gt;");
  });
});
