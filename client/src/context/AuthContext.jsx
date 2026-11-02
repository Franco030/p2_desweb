import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import authService from '../services/AuthService';
import HttpClient from '../services/HttpClient';
import TokenStorage from '../services/TokenStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    HttpClient.getInstance().onUnauthorized(() => {
      TokenStorage.clear();
      setUsuario(null);
    });
    authService.perfil().then(setUsuario).finally(() => setCargando(false));
  }, []);

  const login = useCallback(async (...args) => {
    const perfil = await authService.login(...args);
    setUsuario(perfil);
    return perfil;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUsuario(null);
  }, []);

  const valor = useMemo(() => ({ usuario, cargando, login, logout }), [usuario, cargando, login, logout]);
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
