import { createContext, useContext, useState } from 'react';
import { api } from '../services/api';
const C = createContext();
function getStoredUser() {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  if (!token || !storedUser) return null;
  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
}
export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  async function register(username, password) {
    await api.post('/auth/register', { username, password });
  }
  async function login(username, password) {
    const { data } = await api.post('/auth/login', { username, password });
    if (!data?.token || !data?.user) throw new Error('Invalid login response');
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  }
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }
  return <C.Provider value={{ user, register, login, logout }}>{children}</C.Provider>;
}
export const useAuth = () => useContext(C);
