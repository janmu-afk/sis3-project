import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try { const { data } = await api.get("/user/session"); setUser(data || null); }
    catch { setUser(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login    = async (body) => { await api.post("/user/login", body); await refresh(); };
  const register = async (body) => { await api.post("/user/register", body); await refresh(); };
  const logout   = async () => { await api.get("/user/logout"); await refresh(); };

  return <Ctx.Provider value={{ user, loading, refresh, login, register, logout }}>{children}</Ctx.Provider>;
}
