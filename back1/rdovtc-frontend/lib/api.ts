import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: false,
});

// Attach token from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('rdovtc_token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// On 401 → clear session and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('rdovtc_token');
      localStorage.removeItem('rdovtc_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  changePassword: (data: {
    username: string; old_password: string;
    new_password: string; new_password_confirmation: string;
  }) => api.post('/auth/change-password', data),
  updatePassword: (data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }) => api.put('/auth/password', data),
};

// ── Students ─────────────────────────────────────────────────────────────────
export const studentsApi = {
  list: (params?: Record<string, string>) => api.get('/students', { params }),
  get: (id: number) => api.get(`/students/${id}`),
  create: (data: Record<string, unknown>) => api.post('/students', data),
  delete: (id: number) => api.delete(`/students/${id}`),
};

// ── Branches ─────────────────────────────────────────────────────────────────
export const branchesApi = {
  list: () => api.get('/branches'),
  get: (id: number) => api.get(`/branches/${id}`),
  create: (data: { branch_name: string; course_ids?: number[] }) =>
    api.post('/branches', data),
  delete: (id: number) => api.delete(`/branches/${id}`),
};

// ── Courses ──────────────────────────────────────────────────────────────────
export const coursesApi = {
  list: () => api.get('/courses'),
  byBranch: (branch_name: string) =>
    api.get('/courses/by-branch', { params: { branch_name } }),
};

// ── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  list: () => api.get('/users'),
  create: (data: Record<string, unknown>) => api.post('/users', data),
  delete: (id: number) => api.delete(`/users/${id}`),
};
