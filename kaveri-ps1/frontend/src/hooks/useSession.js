import { useState, useEffect } from 'react';

export function useSession() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load session from localStorage on mount
    const savedUser = localStorage.getItem('ksp_user_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (name, role) => {
    const newUser = {
      id: `KSP-UID-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      role,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('ksp_user_session', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('ksp_user_session');
    setUser(null);
  };

  return { user, loading, login, logout };
}
