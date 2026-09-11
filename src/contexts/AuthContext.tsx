import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { fetchCurrentUser } from '../services/authService';

export interface Permission {
  modul: string;
  lihat: boolean;
  buat: boolean;
  ubah: boolean;
  hapus: boolean;
  proses: boolean;
  setujui: boolean;
  export: boolean;
}

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: string;
  roleId?: string;
  isActive?: boolean;
  permissions: Permission[];
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('wms_token');
    const storedUser = localStorage.getItem('wms_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        // Invalid stored data, clear it
        localStorage.removeItem('wms_token');
        localStorage.removeItem('wms_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('wms_token', newToken);
    localStorage.setItem('wms_user', JSON.stringify(newUser));
  };



  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('wms_token');
    localStorage.removeItem('wms_user');
    // Clear business unit selection on logout
    localStorage.removeItem('wms_unit_bisnis');
  };

  /**
   * Re-fetch user data dari backend untuk sinkronisasi permissions terbaru.
   * Dipanggil setelah admin mengubah hak akses user ini.
   */
  const refreshUser = useCallback(async () => {
    const storedToken = token || localStorage.getItem('wms_token');
    if (!storedToken) return;

    try {
      const freshUser = await fetchCurrentUser(storedToken);
      setUser(freshUser);
      localStorage.setItem('wms_user', JSON.stringify(freshUser));
    } catch (error) {
      // Token expired atau invalid, force logout
      logout();
    }
  }, [token]);

  // Poll for user permission updates every 15 seconds
  useEffect(() => {
    if (!token || !user) return;
    const interval = setInterval(() => {
      refreshUser();
    }, 15000); // 15 seconds
    
    return () => clearInterval(interval);
  }, [token, user, refreshUser]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
