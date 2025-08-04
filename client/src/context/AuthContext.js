import { createContext, useState, useEffect } from 'react';
import { getToken, setToken as saveToken, removeToken } from '../api/api';
import { jwtDecode } from 'jwt-decode';   // ← Named import

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());
  const [user,  setUser]  = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const payload = jwtDecode(token);
        setUser({ id: payload.id, role: payload.role });
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = tok => {
    saveToken(tok);
    setToken(tok);
  };

  const logout = () => {
    removeToken();
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
