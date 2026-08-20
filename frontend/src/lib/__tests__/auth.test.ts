import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  refreshAccessToken,
  getValidAccessToken,
} from '../auth';
import { cookies } from 'next/headers';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('lib/auth', () => {
  const mockCookieStore = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  };

  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cookies).mockResolvedValue(
      mockCookieStore as unknown as Awaited<ReturnType<typeof cookies>>
    );
    global.fetch = mockFetch;
  });

  describe('getAccessToken and getRefreshToken', () => {
    it('returns token from cookie store if present', async () => {
      mockCookieStore.get.mockReturnValueOnce({ value: 'my-access-token' });
      const access = await getAccessToken();
      expect(access).toBe('my-access-token');
      expect(mockCookieStore.get).toHaveBeenCalledWith('access_token');

      mockCookieStore.get.mockReturnValueOnce({ value: 'my-refresh-token' });
      const refresh = await getRefreshToken();
      expect(refresh).toBe('my-refresh-token');
      expect(mockCookieStore.get).toHaveBeenCalledWith('refresh_token');
    });

    it('returns undefined if cookie is missing', async () => {
      mockCookieStore.get.mockReturnValue(undefined);
      const access = await getAccessToken();
      const refresh = await getRefreshToken();
      expect(access).toBeUndefined();
      expect(refresh).toBeUndefined();
    });
  });

  describe('setTokens', () => {
    it('sets access token and refresh token', async () => {
      await setTokens('access-123', 'refresh-456');
      expect(mockCookieStore.set).toHaveBeenCalledTimes(2);
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'access_token',
        'access-123',
        expect.objectContaining({
          httpOnly: true,
          path: '/',
        })
      );
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-456',
        expect.objectContaining({
          httpOnly: true,
          path: '/',
        })
      );
    });

    it('sets only access token if refresh token is omitted', async () => {
      await setTokens('access-123');
      expect(mockCookieStore.set).toHaveBeenCalledTimes(1);
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'access_token',
        'access-123',
        expect.any(Object)
      );
    });
  });

  describe('clearTokens', () => {
    it('deletes both access and refresh token cookies', async () => {
      await clearTokens();
      expect(mockCookieStore.delete).toHaveBeenCalledWith('access_token');
      expect(mockCookieStore.delete).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('refreshAccessToken', () => {
    it('returns null if no refresh token is stored', async () => {
      mockCookieStore.get.mockReturnValue(undefined);
      const token = await refreshAccessToken();
      expect(token).toBeNull();
    });

    it('clears tokens and returns null if refresh response fails', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'expired-refresh' });
      mockFetch.mockResolvedValueOnce({ ok: false } as Response);

      const token = await refreshAccessToken();
      expect(token).toBeNull();
      expect(mockCookieStore.delete).toHaveBeenCalledWith('access_token');
      expect(mockCookieStore.delete).toHaveBeenCalledWith('refresh_token');
    });

    it('saves new tokens and returns new access token on success', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'valid-refresh' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access: 'new-access', refresh: 'new-refresh' }),
      } as Response);

      const token = await refreshAccessToken();
      expect(token).toBe('new-access');
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'access_token',
        'new-access',
        expect.any(Object)
      );
    });

    it('returns null on network exception', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'valid-refresh' });
      mockFetch.mockRejectedValueOnce(new Error('Network'));

      const token = await refreshAccessToken();
      expect(token).toBeNull();
    });
  });

  describe('getValidAccessToken', () => {
    it('returns active access token if available', async () => {
      mockCookieStore.get.mockReturnValueOnce({ value: 'active-access' });
      const token = await getValidAccessToken();
      expect(token).toBe('active-access');
    });

    it('falls back to refreshAccessToken when access token is missing', async () => {
      mockCookieStore.get
        .mockReturnValueOnce(undefined) // getAccessToken
        .mockReturnValueOnce({ value: 'valid-refresh' }); // getRefreshToken
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access: 'refreshed-access',
          refresh: 'new-refresh',
        }),
      } as Response);

      const token = await getValidAccessToken();
      expect(token).toBe('refreshed-access');
    });
  });
});
