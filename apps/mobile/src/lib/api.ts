/**
 * Authenticated API client for Hono REST endpoints
 *
 * All Hono endpoints live under /api/mobile/* on the web-client.
 * Auth is via `Authorization: Bearer <clerk_jwt>`.
 */

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
const API_PREFIX = "/api/mobile";

// ─── Error class ──────────────────────────────────────────────
export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message?: string,
  ) {
    super(message ?? `API error ${status}`);
    this.name = "ApiError";
  }
}

// ─── Token getter (set by AuthProvider) ───────────────────────
let _getToken: (() => Promise<string | null>) | null = null;

// Promise that resolves once setTokenGetter has been called
let _resolveTokenReady: (() => void) | null = null;
const _tokenReady = new Promise<void>((resolve) => {
  _resolveTokenReady = resolve;
});

export function setTokenGetter(fn: () => Promise<string | null>) {
  _getToken = fn;
  // Signal that the token getter is now available
  if (_resolveTokenReady) {
    _resolveTokenReady();
    _resolveTokenReady = null;
  }
}

// ─── Internal: get a valid token or throw ─────────────────────
async function acquireToken(): Promise<string> {
  // Wait for setTokenGetter to be called (resolves immediately if already set)
  await _tokenReady;

  if (!_getToken) {
    throw new ApiError(401, null, "Auth not initialized");
  }

  let token = await _getToken();

  // If null, the session may still be initialising — wait up to 2s
  if (!token) {
    for (let attempt = 0; attempt < 4; attempt++) {
      await new Promise((r) => setTimeout(r, 500));
      token = await _getToken();
      if (token) break;
    }
  }

  if (!token) {
    throw new ApiError(401, null, "No auth token available");
  }

  return token;
}

// ─── Core fetch wrapper ───────────────────────────────────────
type FetchOptions = {
  method?: string;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  /** Skip auth header (e.g. for health check) */
  noAuth?: boolean;
};

async function request<T = unknown>(
  path: string,
  opts: FetchOptions = {},
): Promise<T> {
  const { method = "GET", body, params, headers = {}, noAuth } = opts;

  // Build URL
  let url = `${BASE_URL}${API_PREFIX}${path}`;
  if (params) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) qs.set(k, String(v));
    }
    const str = qs.toString();
    if (str) url += `?${str}`;
  }

  // Auth — wait for token, fail fast if unavailable (don't spam server with 401s)
  if (!noAuth) {
    const token = await acquireToken();
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Content-type
  if (body) headers["Content-Type"] = "application/json";

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // 204 No Content
  if (res.status === 204) return undefined as T;

  // Retry once on 401 with a fresh token
  if (res.status === 401 && !noAuth && _getToken) {
    const freshToken = await _getToken();
    if (freshToken && headers["Authorization"] !== `Bearer ${freshToken}`) {
      headers["Authorization"] = `Bearer ${freshToken}`;
      const retry = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (retry.status === 204) return undefined as T;
      const retryJson = await retry.json();
      if (!retry.ok) {
        throw new ApiError(
          retry.status,
          retryJson,
          retryJson?.error ?? `HTTP ${retry.status}`,
        );
      }
      return retryJson as T;
    }
  }

  const json = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, json, json?.error ?? `HTTP ${res.status}`);
  }

  return json as T;
}

// ─── Multipart upload wrapper ─────────────────────────────────
async function uploadRequest<T = unknown>(
  path: string,
  formData: FormData,
): Promise<T> {
  const headers: Record<string, string> = {};

  // Auth
  const token = await acquireToken();
  headers["Authorization"] = `Bearer ${token}`;

  // Do NOT set Content-Type — let fetch set the multipart boundary
  const url = `${BASE_URL}${API_PREFIX}${path}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
  });

  if (res.status === 204) return undefined as T;

  const json = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, json, json?.error ?? `HTTP ${res.status}`);
  }

  return json as T;
}

// ─── Convenience verbs ────────────────────────────────────────
export const api = {
  get: <T = unknown>(path: string, params?: FetchOptions["params"]) =>
    request<T>(path, { method: "GET", params }),

  post: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body }),

  patch: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body }),

  put: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body }),

  delete: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: "DELETE", body }),

  /** Multipart file upload (FormData) */
  upload: <T = unknown>(path: string, formData: FormData) =>
    uploadRequest<T>(path, formData),

  /** Raw request for custom needs */
  request,
} as const;
