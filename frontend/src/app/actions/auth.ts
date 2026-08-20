'use server';

import { redirect } from 'next/navigation';
import { setTokens, clearTokens } from '@/lib/auth';

// API_URL → server-side (Docker internal: http://backend:8000)
// NEXT_PUBLIC_API_URL → fallback when running without Docker (http://localhost:8000)
const API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000';

export type AuthState = {
  error?: string;
  success?: boolean;
};

export async function loginAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email')?.toString().trim();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    return { error: 'Please provide both email and password.' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        error: errData.detail || 'Invalid email or password. Please try again.',
      };
    }

    const data = await res.json();
    await setTokens(data.access, data.refresh);
  } catch {
    return { error: 'Failed to connect to authentication server.' };
  }

  redirect('/');
}

export async function signupAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email')?.toString().trim();
  const username = formData.get('username')?.toString().trim() || email;
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    return { error: 'Please provide both email and password.' };
  }

  try {
    // 1. Sign Up
    const signupRes = await fetch(`${API_BASE_URL}/api/auth/signup/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });

    if (!signupRes.ok) {
      const errData = await signupRes.json().catch(() => ({}));
      const firstError = Object.values(errData)[0];
      const errorMsg = Array.isArray(firstError)
        ? firstError[0]
        : typeof firstError === 'string'
          ? firstError
          : 'Signup failed.';
      return { error: errorMsg };
    }

    // 2. Auto-login to obtain JWT tokens
    const loginRes = await fetch(`${API_BASE_URL}/api/auth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!loginRes.ok) {
      return {
        error: 'Account created, but automatic login failed. Please sign in.',
      };
    }

    const data = await loginRes.json();
    await setTokens(data.access, data.refresh);
  } catch {
    return { error: 'Failed to connect to authentication server.' };
  }

  redirect('/');
}

export async function logoutAction() {
  await clearTokens();
  redirect('/login');
}
