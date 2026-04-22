// tests/view/sub-atoms/elements/escape.test.ts
// XSS prevention — verifies every dangerous character is neutralised.
// Security-critical: a gap here means raw user input reaches the browser DOM.

import { describe, it, expect } from "bun:test";
import { escapeHtml } from "../../../../src/view/sub-atoms/elements/escape";

describe("escapeHtml", () => {
  // ── Individual character escapes ──────────────────────────────────────────

  it("escapes & to &amp;", () => {
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });

  it("escapes < to &lt;", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
  });

  it("escapes > to &gt;", () => {
    expect(escapeHtml("a > b")).toBe("a &gt; b");
  });

  it('escapes " to &quot;', () => {
    expect(escapeHtml('"value"')).toBe("&quot;value&quot;");
  });

  it("escapes ' to &#039;", () => {
    expect(escapeHtml("it's")).toBe("it&#039;s");
  });

  // ── Safe strings pass through unchanged ───────────────────────────────────

  it("returns plain alphanumeric strings unchanged", () => {
    expect(escapeHtml("HelloWorld123")).toBe("HelloWorld123");
  });

  it("returns empty string unchanged", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("does not alter spaces or hyphens", () => {
    expect(escapeHtml("item-modifier name")).toBe("item-modifier name");
  });

  // ── Classic XSS payload ───────────────────────────────────────────────────
  // If the output of escapeHtml is placed inside an HTML attribute or element,
  // this script tag must NOT execute.

  it("neutralises a full script-injection payload", () => {
    const payload = '<script>alert("xss")</script>';
    const result = escapeHtml(payload);
    expect(result).toBe("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;");
    // Confirm the literal word "script" is still visible (not stripped, just escaped)
    expect(result).toContain("script");
    // Confirm no angle brackets remain
    expect(result).not.toContain("<");
    expect(result).not.toContain(">");
  });

  // ── All five characters together ──────────────────────────────────────────

  it("escapes all five dangerous characters in a single string", () => {
    const input = `& < > " '`;
    expect(escapeHtml(input)).toBe("&amp; &lt; &gt; &quot; &#039;");
  });
});
