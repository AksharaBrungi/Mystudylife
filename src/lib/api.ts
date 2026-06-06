import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Automatically add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (token expiration)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // We could use window.dispatchEvent or a callback if needed
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  signup: (userData: any) => api.post('/auth/signup', userData),
  me: () => api.get('/auth/me'),
};

export const taskAPI = {
  getAll: () => api.get('/tasks'),
  create: (data: any) => api.post('/tasks', data),
  update: (id: number, data: any) => api.patch(`/tasks/${id}`, data),
  delete: (id: number) => api.delete(`/tasks/${id}`),
};

export const attendanceAPI = {
  getAll: () => api.get('/attendance'),
  create: (data: any) => api.post('/attendance', data),
  update: (id: number, data: any) => api.patch(`/attendance/${id}`, data),
  delete: (id: number) => api.delete(`/attendance/${id}`),
};

export const timetableAPI = {
  getAll: () => api.get('/timetable'),
  create: (data: any) => api.post('/timetable', data),
  delete: (id: number) => api.delete(`/timetable/${id}`),
};

export const examAPI = {
  getAll: () => api.get('/exams'),
  create: (data: any) => api.post('/exams', data),
  delete: (id: number) => api.delete(`/exams/${id}`),
};

export const notesAPI = {
  getAll: () => api.get('/notes'),
  create: (data: any) => api.post('/notes', data),
  update: (id: number, data: any) => api.patch(`/notes/${id}`, data),
  delete: (id: number) => api.delete(`/notes/${id}`),
};

export const aiAPI = {
  chat: (message: string) => api.post('/ai/chat', { message }),
};
