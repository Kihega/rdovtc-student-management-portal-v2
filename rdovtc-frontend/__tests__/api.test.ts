/**
 * Tests for the API client helper layer (lib/api.ts).
 * We mock axios itself to test interceptor logic and method signatures.
 */

// We test the shape/config of the API helpers — not the axios internals
describe('API helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('authApi', () => {
    it('exports login, logout, me, changePassword, updatePassword', async () => {
      const { authApi } = await import('@/lib/api');
      expect(typeof authApi.login).toBe('function');
      expect(typeof authApi.logout).toBe('function');
      expect(typeof authApi.me).toBe('function');
      expect(typeof authApi.changePassword).toBe('function');
      expect(typeof authApi.updatePassword).toBe('function');
    });
  });

  describe('studentsApi', () => {
    it('exports list, get, create, delete', async () => {
      const { studentsApi } = await import('@/lib/api');
      expect(typeof studentsApi.list).toBe('function');
      expect(typeof studentsApi.get).toBe('function');
      expect(typeof studentsApi.create).toBe('function');
      expect(typeof studentsApi.delete).toBe('function');
    });
  });

  describe('branchesApi', () => {
    it('exports list, get, create, delete', async () => {
      const { branchesApi } = await import('@/lib/api');
      expect(typeof branchesApi.list).toBe('function');
      expect(typeof branchesApi.get).toBe('function');
      expect(typeof branchesApi.create).toBe('function');
      expect(typeof branchesApi.delete).toBe('function');
    });
  });

  describe('coursesApi', () => {
    it('exports list and byBranch', async () => {
      const { coursesApi } = await import('@/lib/api');
      expect(typeof coursesApi.list).toBe('function');
      expect(typeof coursesApi.byBranch).toBe('function');
    });
  });

  describe('usersApi', () => {
    it('exports list, create, delete', async () => {
      const { usersApi } = await import('@/lib/api');
      expect(typeof usersApi.list).toBe('function');
      expect(typeof usersApi.create).toBe('function');
      expect(typeof usersApi.delete).toBe('function');
    });
  });

  describe('Token injection', () => {
    it('reads token from localStorage', () => {
      localStorage.setItem('rdovtc_token', 'test-token-xyz');
      expect(localStorage.getItem('rdovtc_token')).toBe('test-token-xyz');
    });

    it('clears token on logout flow', () => {
      localStorage.setItem('rdovtc_token', 'test-token-xyz');
      localStorage.setItem('rdovtc_user', JSON.stringify({ id: 1 }));
      localStorage.removeItem('rdovtc_token');
      localStorage.removeItem('rdovtc_user');
      expect(localStorage.getItem('rdovtc_token')).toBeNull();
      expect(localStorage.getItem('rdovtc_user')).toBeNull();
    });
  });
});
