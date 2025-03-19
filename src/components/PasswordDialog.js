// src/components/PasswordDialog.js
import React, { useState, useEffect } from 'react';
import { verifyPassword, unlockApp } from '../utils/passwordManager';

const PasswordDialog = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const passwordInput = document.getElementById('password-input');
    if (passwordInput) {
      passwordInput.focus();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    
    setIsVerifying(true);
    setError('');
    
    try {
      const isValid = await verifyPassword(password);
      
      if (isValid) {
        unlockApp();
        if (onSuccess) onSuccess();
      } else {
        setError('Incorrect password');
      }
    } catch (err) {
      setError(err.message || 'Failed to verify password');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-1">Unlock Chalk</h2>
          <p className="text-gray-400 text-sm">Enter your password to access your data</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isVerifying}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors"
          >
            {isVerifying ? 'Verifying...' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordDialog;