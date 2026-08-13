'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  login: () => false,
  logout: () => {},
  showLoginModal: false,
  setShowLoginModal: () => {},
});

const STORAGE_KEY = 'svc_admin_authenticated';

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  useEffect(() => {
    const savedAuth = localStorage.getItem(STORAGE_KEY);
    if (savedAuth === 'true') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAdmin(true);
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'svcdirectory@gmail.com';
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'onlyonelife';

    if (email.trim().toLowerCase() === adminEmail.trim().toLowerCase() && password === adminPassword) {
      setIsAdmin(true);
      localStorage.setItem(STORAGE_KEY, 'true');
      setShowLoginModal(false);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout, showLoginModal, setShowLoginModal }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
