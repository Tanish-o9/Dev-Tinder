import { createContext, useState, useEffect, useCallback } from "react";
import { getCurrentUser, logout as logoutApi } from "../services/authApi";
import { SocketProvider } from "./SocketContext";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const restoreAuth = useCallback(async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreAuth();
  }, [restoreAuth]);

  const loginUser = (userData) => setUser(userData);

  const logoutUser = async () => {
    try {
      await logoutApi();
    } catch {
      // ignore logout errors
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, setUser }}>
      <SocketProvider active={!!user}>
        {children}
      </SocketProvider>
    </AuthContext.Provider>
  );
}
