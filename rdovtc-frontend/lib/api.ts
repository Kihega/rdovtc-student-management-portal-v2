import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://rdovtc-student-management-portal-v2.onrender.com/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

// Attach JWT token from localStorage to every request
API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('jwt_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear token and redirect to login
API.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('jwt_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login:          (data: { username: string; password: string }) => API.post('/auth/login', data),
  logout:         () => API.post('/auth/logout'),
  me:             () => API.get('/auth/me'),
  refresh:        () => API.post('/auth/refresh'),
  updatePassword: (data: object) => API.put('/auth/password', data),
  changePassword: (data: object) => API.post('/auth/change-password', data),
};

export const studentsApi = {
  list:    (params?: object) => API.get('/students', { params }),
  get:     (id: number)      => API.get(`/students/${id}`),
  create:  (data: object)    => API.post('/students', data),
  delete:  (id: number)      => API.delete(`/students/${id}`),
};

export const branchesApi = {
  list:   ()          => API.get('/branches'),
  get:    (id:number) => API.get(`/branches/${id}`),
  create: (data:object)=> API.post('/branches', data),
  delete: (id:number) => API.delete(`/branches/${id}`),
};

export const coursesApi = {
  list:     ()             => API.get('/courses'),
  byBranch: (branch:string)=> API.get('/courses/by-branch', { params: { branch_name: branch } }),
};

export const usersApi = {
  list:   ()           => API.get('/users'),
  create: (data:object)=> API.post('/users', data),
  delete: (id:number)  => API.delete(`/users/${id}`),
};

export default API;
