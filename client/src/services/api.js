import axios from 'axios';
const configuredApiUrl = import.meta.env.VITE_API_URL || '/api';
const apiUrl = configuredApiUrl.replace(/\/+$/, '');
const baseURL = apiUrl === '/api' || apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

export const api = axios.create({ baseURL });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem('token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
