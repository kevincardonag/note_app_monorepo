import createClient from 'openapi-fetch';
import type { paths } from './api-schema';
import { getValidAccessToken } from './auth';

// API_URL → server-side (Docker internal: http://backend:8000)
// NEXT_PUBLIC_API_URL → fallback when running without Docker (http://localhost:8000)
const API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000';

export function createApiClient(token?: string | null) {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return createClient<paths>({
    baseUrl: API_BASE_URL,
    headers,
  });
}

/**
 * Creates an API client for Server Components / Server Actions.
 * Automatically attempts token refresh if the access token cookie has expired.
 */
export async function getServerApiClient() {
  const token = await getValidAccessToken();
  return createApiClient(token);
}
