import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password, department) => 
    api.post('/auth/register', { name, email, password, department }),
  getProfile: () => api.get('/auth/profile')
};

// Book APIs
export const bookAPI = {
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  getSimilar: (id) => api.get(`/books/${id}/similar`)
};

// Borrowed APIs
export const borrowedAPI = {
  getAll: () => api.get('/borrowed'),
  borrow: (book_id, due_date) => api.post('/borrowed', { book_id, due_date }),
  return: (id) => api.put(`/borrowed/${id}/return`)
};

// Reservation APIs
export const reservationAPI = {
  getAll: () => api.get('/reservations'),
  create: (book_id) => api.post('/reservations', { book_id }),
  cancel: (id) => api.delete(`/reservations/${id}`)
};

// Seat APIs
export const seatAPI = {
  getAll: () => api.get('/seats'),
  occupy: (id) => api.post(`/seats/${id}/occupy`),
  release: (id) => api.post(`/seats/${id}/release`)
};

// Admin APIs
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  addBook: (data) => api.post('/admin/books', data),
  updateBook: (id, data) => api.put(`/admin/books/${id}`, data),
  deleteBook: (id) => api.delete(`/admin/books/${id}`),
  getUsers: () => api.get('/admin/users'),
  getReservations: () => api.get('/admin/reservations'),
  approveReservation: (id) => api.put(`/admin/reservations/${id}/approve`),
  rejectReservation: (id) => api.put(`/admin/reservations/${id}/reject`),
  initializeSeats: (sections) => api.post('/admin/seats/initialize', { sections })
};

export default api;
