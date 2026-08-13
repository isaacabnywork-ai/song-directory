'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { LockKey, X, Check, Key, Envelope } from '@phosphor-icons/react';

export default function AdminLoginModal() {
  const { showLoginModal, setShowLoginModal, login } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!showLoginModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);
    if (!success) {
      setError(true);
    } else {
      setEmail('');
      setPassword('');
      setError(false);
    }
  };

  const handleClose = () => {
    setShowLoginModal(false);
    setError(false);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-white dark:bg-[#222222] rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-[#333333] relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#2c2c2c] transition-colors"
        >
          <X className="text-xl" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <LockKey className="text-2xl" weight="fill" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Authentication</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter your email and password to unlock editing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <Envelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(false);
                }}
                placeholder="Admin Email"
                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] border ${
                  error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-[#333] focus:ring-blue-500'
                } focus:outline-none focus:ring-2 text-sm text-gray-900 dark:text-white transition-all`}
                autoFocus
              />
            </div>
            
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="Admin Password"
                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] border ${
                  error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-[#333] focus:ring-blue-500'
                } focus:outline-none focus:ring-2 text-sm text-gray-900 dark:text-white transition-all`}
              />
            </div>
            
            {error && (
              <p className="text-xs text-red-500 mt-1.5 px-1 font-medium">
                Incorrect email or password.
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c2c2c] text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              <Check weight="bold" /> Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
