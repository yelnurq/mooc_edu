import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Добавляем перехватчик перед каждым запросом
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // В твоем случае (кастомная таблица Token) бэкенд может ожидать либо 'Bearer ', либо просто токен.
    // Обычно используется стандарт:
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;