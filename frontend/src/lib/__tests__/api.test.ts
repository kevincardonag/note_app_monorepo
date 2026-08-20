import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApiClient, getServerApiClient } from '../api';
import { getValidAccessToken } from '../auth';

vi.mock('../auth', () => ({
  getValidAccessToken: vi.fn(),
}));

describe('lib/api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createApiClient', () => {
    it('creates client with Authorization header when token is supplied', () => {
      const client = createApiClient('sample-jwt-token');
      expect(client).toBeDefined();
      expect(typeof client.GET).toBe('function');
      expect(typeof client.POST).toBe('function');
    });

    it('creates client without Authorization header when token is null or undefined', () => {
      const client = createApiClient(null);
      expect(client).toBeDefined();
      expect(typeof client.GET).toBe('function');
    });
  });

  describe('getServerApiClient', () => {
    it('fetches valid token and initializes client', async () => {
      vi.mocked(getValidAccessToken).mockResolvedValueOnce(
        'valid-server-token'
      );
      const client = await getServerApiClient();
      expect(getValidAccessToken).toHaveBeenCalled();
      expect(client).toBeDefined();
    });
  });
});
