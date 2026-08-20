import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginAction, signupAction, logoutAction } from '../auth';
import { setTokens, clearTokens } from '@/lib/auth';
import { redirect } from 'next/navigation';

vi.mock('@/lib/auth', () => ({
  setTokens: vi.fn(),
  clearTokens: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('auth actions', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
  });

  describe('loginAction', () => {
    it('returns error if email or password missing', async () => {
      const formData = new FormData();
      formData.append('email', '');
      formData.append('password', '');

      const result = await loginAction(null, formData);
      expect(result).toEqual({
        error: 'Please provide both email and password.',
      });
    });

    it('returns error if authentication response is not ok', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'wrongpass');

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          detail: 'No active account found with the given credentials',
        }),
      } as Response);

      const result = await loginAction(null, formData);
      expect(result).toEqual({
        error: 'No active account found with the given credentials',
      });
    });

    it('returns fallback error when response json parsing fails', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'wrongpass');

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as unknown as Response);

      const result = await loginAction(null, formData);
      expect(result).toEqual({
        error: 'Invalid email or password. Please try again.',
      });
    });

    it('sets tokens and redirects on successful login', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'correctpass');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access: 'access-token-123',
          refresh: 'refresh-token-456',
        }),
      } as Response);

      await loginAction(null, formData);
      expect(setTokens).toHaveBeenCalledWith(
        'access-token-123',
        'refresh-token-456'
      );
      expect(redirect).toHaveBeenCalledWith('/');
    });

    it('handles network failure gracefully', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'pass');

      mockFetch.mockRejectedValueOnce(new Error('Network Error'));

      const result = await loginAction(null, formData);
      expect(result).toEqual({
        error: 'Failed to connect to authentication server.',
      });
    });
  });

  describe('signupAction', () => {
    it('returns error if fields missing', async () => {
      const formData = new FormData();
      formData.append('email', '');

      const result = await signupAction(null, formData);
      expect(result).toEqual({
        error: 'Please provide both email and password.',
      });
    });

    it('returns backend validation error on failed signup', async () => {
      const formData = new FormData();
      formData.append('email', 'existing@example.com');
      formData.append('password', 'pwd');

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          email: ['A user with that email already exists.'],
        }),
      } as Response);

      const result = await signupAction(null, formData);
      expect(result).toEqual({
        error: 'A user with that email already exists.',
      });
    });

    it('returns error when signup succeeds but auto-login fails', async () => {
      const formData = new FormData();
      formData.append('email', 'new@example.com');
      formData.append('password', 'pwd123');

      mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response) // Signup OK
        .mockResolvedValueOnce({ ok: false } as Response); // Auto-login failed

      const result = await signupAction(null, formData);
      expect(result).toEqual({
        error: 'Account created, but automatic login failed. Please sign in.',
      });
    });

    it('sets tokens and redirects on successful signup and auto-login', async () => {
      const formData = new FormData();
      formData.append('email', 'new@example.com');
      formData.append('username', 'newuser');
      formData.append('password', 'pwd123');

      mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access: 'acc-123', refresh: 'ref-456' }),
        } as Response);

      await signupAction(null, formData);
      expect(setTokens).toHaveBeenCalledWith('acc-123', 'ref-456');
      expect(redirect).toHaveBeenCalledWith('/');
    });

    it('handles network failure gracefully during signup', async () => {
      const formData = new FormData();
      formData.append('email', 'new@example.com');
      formData.append('password', 'pwd123');

      mockFetch.mockRejectedValueOnce(new Error('Network Error'));

      const result = await signupAction(null, formData);
      expect(result).toEqual({
        error: 'Failed to connect to authentication server.',
      });
    });
  });

  describe('logoutAction', () => {
    it('clears tokens and redirects to login', async () => {
      await logoutAction();
      expect(clearTokens).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith('/login');
    });
  });
});
