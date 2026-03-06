// src/controller/sub-atoms/response/set-html-content-type.ts
// Sets the response content-type header to HTML.

export function setHtml(headers: Record<string, string | number>): void {
  headers["content-type"] = "text/html; charset=utf-8";
}
