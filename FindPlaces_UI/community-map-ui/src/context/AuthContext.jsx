import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";


export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUser({
        username: decoded.sub,
        role: decoded.role,
      });
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    setUser({
      username: decoded.sub,
      role: decoded.role,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ ADD THIS (THIS WAS MISSING)
export const useAuth = () => useContext(AuthContext);