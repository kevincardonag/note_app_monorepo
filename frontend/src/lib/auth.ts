import { cookies } from 'next/headers';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// API_URL → server-side (Docker internal: http://backend:8000)
// NEXT_PUBLIC_API_URL → fallback when running without Docker (http://localhost:8000)
const API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000';

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_KEY)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_KEY)?.value;
}

export async function setTokens(accessToken: string, refreshToken?: string) {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_KEY, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  });

  if (refreshToken) {
    cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }
}

export async function clearTokens() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_KEY);
  cookieStore.delete(REFRESH_TOKEN_KEY);
}

/**
 * Attempts to refresh the access token using the stored refresh token.
 * Returns the new access token on success, or null if refresh failed.
 */
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!res.ok) {
      // Refresh token is also expired/invalid — clear everything
      await clearTokens();
      return null;
    }

    const data = await res.json();
    // data.access is the new access token; data.refresh is the new rotated refresh token
    await setTokens(data.access, data.refresh);
    return data.access;
  } catch {
    return null;
  }
}

/**
 * Returns a valid access token, attempting a refresh if the current one is missing.
 * Returns null if no valid token can be obtained.
 */
export async function getValidAccessToken(): Promise<string | null> {
  const accessToken = await getAccessToken();
  if (accessToken) return accessToken;

  // Access token cookie expired but refresh token may still be valid
  return refreshAccessToken();
}
