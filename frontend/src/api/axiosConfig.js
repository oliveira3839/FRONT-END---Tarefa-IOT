import axios from 'axios';

// 1. Pega a URL da API (da Vercel, se estiver em produção)
//    OU usa a URL local (se estiver rodando 'npm start' na sua máquina)
const baseURL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

const api = axios.create({
  // 2. Define a URL base para todas as chamadas
  baseURL: baseURL
});

// 3. O interceptor continua igual, anexando o token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
