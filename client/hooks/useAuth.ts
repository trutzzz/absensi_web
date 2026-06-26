import { useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (email: string, password: string) => {
    // In a real app, this would validate against a backend
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: email.split("@")[0],
    };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("loginTime", new Date().toISOString());
    return newUser;
  };

  const signup = (name: string, email: string, password: string) => {
    // In a real app, this would create a user on backend
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
    };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("loginTime", new Date().toISOString());
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("attendanceRecords");
  };

  const isAuthenticated = !!user;

  return { user, login, signup, logout, isAuthenticated };
};
