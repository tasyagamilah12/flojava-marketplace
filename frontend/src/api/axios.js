import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5050/api',
});

// Interceptor untuk menyisipkan token Auth secara otomatis
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;