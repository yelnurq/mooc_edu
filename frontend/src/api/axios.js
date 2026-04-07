import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// 1. ПЕРЕХВАТЧИК ЗАПРОСОВ: Добавляем токен в каждый запрос
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 2. ПЕРЕХВАТЧИК ОТВЕТОВ: Очистка и редирект при ошибке 401
api.interceptors.response.use(
  (response) => {
    // Если всё прошло успешно, просто возвращаем данные
    return response;
  },
  (error) => {
    // Проверяем, если бэкенд ответил 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      console.warn("Сессия истекла или токен невалиден. Выход...");
      
      // Удаляем "битый" токен
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Перенаправляем на логин (через window.location, так как это не React-компонент)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;