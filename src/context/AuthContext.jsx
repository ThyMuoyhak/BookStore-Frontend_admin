import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Auth, API } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const refreshUser = useCallback(async () => {
    if (!Auth.isLoggedIn()) {
      setUser(null);
      setInitialized(true);
      return;
    }
    try {
      const me = await API.me();
      Auth.setUser(me);
      setUser(me);
    } catch (err) {
      if (err.status === 401) Auth.clearToken();
      setUser(Auth.getUser());
    } finally {
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email, password) => {
    const data = await API.login(email, password);
    Auth.setToken(data.access_token);
    const me = await API.me();
    Auth.setUser(me);
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(() => {
    Auth.clearToken();
    setUser(null);
  }, []);

  const value = { user, setUser, initialized, refreshUser, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
