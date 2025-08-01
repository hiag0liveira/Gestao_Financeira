import axios from 'axios';
import { getCookie } from 'cookies-next';
import qs from 'qs';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
    paramsSerializer: (params) => {
        return qs.stringify(params, { arrayFormat: 'repeat' });
    },
});

apiClient.interceptors.request.use(
    (config) => {
        if (config.url === '/auth/login' || config.url === '/auth/signup') {
            return config;
        }

        const token = getCookie('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
