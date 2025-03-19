// src/components/SettingsView.js
import React, { useState } from 'react';
import { downloadExportFile, readImportFile, importData } from '../data/export-import';

const SettingsView = ({ onBack, onThemeChange, isDarkMode, onResetApp }) => {
  const [importStatus, setImportStatus] = useState(null);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [betaFeedbackEmail, setBetaFeedbackEmail] = useState('');
  
  const handleImportFile = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      
      const jsonData = await readImportFile(file);
      const result = await importData(jsonData);
      
      setImportStatus(result);
      
      if (result.success) {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setImportStatus({ success: false, message: error.message });
    }
  };
  
  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    window.open(`mailto:your-beta-feedback@example.com?subject=Chalk Beta Feedback&body=Email: ${betaFeedbackEmail}%0A%0AFeedback:%0A%0A`, '_blank');
    setBetaFeedbackEmail('');
  };
  
  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center mb-6 pb-4 border-b border-gray-800">
        <button 
          className="flex items-center mr-4 px-3 py-1.5 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          onClick={onBack}
        >
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <h2 className="text-xl font-bold text-white">Settings</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
          <h3 className="text-white text-lg font-medium mb-4">Display Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 block mb-2">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                <button 
                  className={`flex flex-col items-center p-3 rounded-lg transition-colors border ${
                    currentTheme === 'dark' 
                      ? 'border-indigo-500 bg-gray-700' 
                      : 'border-gray-700 bg-gray-800 hover:bg-gray-750'
                  }`}
                  onClick={() => onThemeChange('dark')}
                >
                  <div className="w-full h-12 bg-gray-900 rounded-md mb-2 overflow-hidden">
                    <div className="w-8 h-2 bg-gray-700 rounded-full mt-2 ml-2"></div>
                    <div className="w-6 h-2 bg-gray-700 rounded-full mt-1 ml-2"></div>
                    <div className="w-10 h-2 bg-gray-700 rounded-full mt-1 ml-2"></div>
                  </div>
                  <span className="text-sm font-medium text-white">Dark</span>
                </button>
                
                <button 
                  className={`flex flex-col items-center p-3 rounded-lg transition-colors border ${
                    currentTheme === 'light' 
                      ? 'border-indigo-500 bg-gray-700' 
                      : 'border-gray-700 bg-gray-800 hover:bg-gray-750'
                  }`}
                  onClick={() => onThemeChange('light')}
                >
                  <div className="w-full h-12 bg-white rounded-md mb-2 overflow-hidden">
                    <div className="w-8 h-2 bg-gray-200 rounded-full mt-2 ml-2"></div>
                    <div className="w-6 h-2 bg-gray-200 rounded-full mt-1 ml-2"></div>
                    <div className="w-10 h-2 bg-gray-200 rounded-full mt-1 ml-2"></div>
                  </div>
                  <span className="text-sm font-medium text-white">Light</span>
                </button>
                
                <button 
                  className={`flex flex-col items-center p-3 rounded-lg transition-colors border ${
                    currentTheme === 'neon' 
                      ? 'border-indigo-500 bg-gray-700' 
                      : 'border-gray-700 bg-gray-800 hover:bg-gray-750'
                  }`}
                  onClick={() => onThemeChange('neon')}
                >
                  <div className="w-full h-12 bg-blue-900 rounded-md mb-2 overflow-hidden relative">
                    <div className="w-8 h-2 bg-pink-500 rounded-full mt-2 ml-2 shadow-lg shadow-pink-500/50"></div>
                    <div className="w-6 h-2 bg-blue-500 rounded-full mt-1 ml-2 shadow-lg shadow-blue-500/50"></div>
                    <div className="w-10 h-2 bg-purple-500 rounded-full mt-1 ml-2 shadow-lg shadow-purple-500/50"></div>
                  </div>
                  <span className="text-sm font-medium text-white">Neon</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
          <h3 className="text-white text-lg font-medium mb-4">Beta Settings</h3>
          
          <div className="mb-4">
            <p className="text-gray-300 text-sm">
              You are using <span className="text-indigo-400 font-medium">Chalk Beta v1.0.0</span>
            </p>
          </div>
          
          <div className="mb-4">
            <h4 className="text-white font-medium mb-2">Submit Feedback</h4>
            <form onSubmit={handleSubmitFeedback} className="space-y-3">
              <div>
                <input
                  type="email"
                  placeholder="Your email (optional)"
                  value={betaFeedbackEmail}
                  onChange={(e) => setBetaFeedbackEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
              >
                Submit Feedback
              </button>
            </form>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
          <h3 className="text-white text-lg font-medium mb-4">Data Management</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-white font-medium mb-2">Backup Data</h4>
              <p className="text-gray-400 text-sm mb-2">
                Export all your boards, tasks, and settings to a backup file.
              </p>
              <button
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
                onClick={downloadExportFile}
              >
                Export Data
              </button>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">Restore Data</h4>
              <p className="text-gray-400 text-sm mb-2">
                Import your boards and tasks from a backup file.
              </p>
              <div className="flex flex-col space-y-2">
                <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md cursor-pointer text-center transition-colors">
                  Import Data
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportFile}
                  />
                </label>
                
                {importStatus && (
                  <div className={`text-sm mt-2 p-2 rounded ${
                    importStatus.success ? 'bg-emerald-900/50 text-emerald-300' : 'bg-red-900/50 text-red-300'
                  }`}>
                    {importStatus.message}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">Reset Application</h4>
              <p className="text-gray-400 text-sm mb-2">
                Clear all data and reset Chalk to its default state.
              </p>
              
              {!isConfirmingReset ? (
                <button
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                  onClick={() => setIsConfirmingReset(true)}
                >
                  Reset Application
                </button>
              ) : (
                <div className="bg-gray-750 p-3 rounded-md border border-red-600">
                  <p className="text-white text-sm mb-3">
                    Are you sure? This will permanently delete all your data!
                  </p>
                  <div className="flex space-x-3">
                    <button
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors"
                      onClick={onResetApp}
                    >
                      Yes, Reset Everything
                    </button>
                    <button
                      className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm transition-colors"
                      onClick={() => setIsConfirmingReset(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
          <h3 className="text-white text-lg font-medium mb-4">About Chalk</h3>
          
          <div className="space-y-3">
            <p className="text-gray-300">
              <span className="text-white font-medium">Version:</span> 1.0.0-beta
            </p>
            <p className="text-gray-300">
              Chalk is a local-first productivity application designed to help you organize tasks and projects with a beautiful, intuitive interface.
            </p>
            <p className="text-gray-300">
              <span className="text-white font-medium">Local-first:</span> Your data stays on your computer and is stored locally.
            </p>
            <div className="pt-3 border-t border-gray-700 mt-3">
              <p className="text-gray-400 text-sm">
                © 2023 Chalk App. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;