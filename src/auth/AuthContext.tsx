import { createContext, useContext, useState } from "react";

type Role = "admin" | "user";

interface AuthState {
  isAuthenticated: boolean;
  role: Role;
}

interface AuthContextType {
  auth: AuthState;
  login: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    role: "user",
  });

  const login = (role: Role) => {
    setAuth({ isAuthenticated: true, role });
  };

  const logout = () => {
    setAuth({ isAuthenticated: false, role: "user" });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
