// src/browser/sub-atoms/utilities/fetch-json.ts
// Type-safe wrapper around the browser Fetch API.
// Every API call in the browser layer goes through this sub-atom.

/** Shape returned when the server sends an error response. */
export interface ApiError {
  readonly message: string;
  readonly status: number;
}

/**
 * Sends a request and parses the JSON response.
 * Throws an ApiError if the response is not ok.
 */
export async function fetchJson<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer dev-admin-token",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as Record<string, unknown>;
      if (typeof body["error"] === "string") message = body["error"];
    } catch {
      // response body wasn't JSON — keep the default message
    }
    const error: ApiError = { message, status: response.status };
    throw error;
  }

  // 204 No Content — no body to parse (e.g. after DELETE)
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Convenience wrapper: POST JSON body and parse the response.
 */
export async function postJson<T>(
  url: string,
  data: Record<string, unknown>
): Promise<T> {
  return fetchJson<T>(url, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Convenience wrapper: PUT JSON body and parse the response.
 */
export async function putJson<T>(
  url: string,
  data: Record<string, unknown>
): Promise<T> {
  return fetchJson<T>(url, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Convenience wrapper: DELETE request and parse the response.
 */
export async function deleteJson<T>(url: string): Promise<T> {
  return fetchJson<T>(url, { method: "DELETE" });
}
