// src/components/Sidebar.js
import React, { useState } from 'react';

const Sidebar = ({ 
  groups, 
  currentGroupId, 
  onSelectGroup, 
  onCreateGroup,
  isDarkMode,
  onToggleDarkMode,
  onShowDashboard,
  onShowAchievements
}) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName.trim());
      setNewGroupName('');
      setIsCreating(false);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCreateGroup();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setNewGroupName('');
    }
  };
  
  return (
    <div className="w-64 h-full bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="px-4 py-4 flex items-center justify-between border-b border-gray-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-500 text-transparent bg-clip-text">Chalk</h1>
        <button 
          className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          onClick={onToggleDarkMode}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="px-4 py-2 space-y-2 border-b border-gray-800">
        <button 
          onClick={onShowDashboard}
          className="w-full flex items-center px-2 py-2 rounded-md bg-indigo-800 hover:bg-indigo-700 text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 opacity-80" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
          </svg>
          Dashboard
        </button>
        
        <button 
          onClick={onShowAchievements}
          className="w-full flex items-center px-2 py-2 rounded-md bg-amber-800 hover:bg-amber-700 text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 opacity-80" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Achievements
        </button>
      </div>
      
      {/* Workspaces Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 tracking-wider">WORKSPACES</span>
          <button 
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
            onClick={() => setIsCreating(true)}
            title="Create new workspace"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {isCreating && (
          <div className="mx-3 mb-2 p-2 bg-gray-800 rounded-md border border-gray-700">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="New workspace name..."
              onKeyDown={handleKeyDown}
              className="w-full bg-gray-800 text-gray-200 text-sm border-0 focus:ring-0 py-1 px-0.5 focus:outline-none"
              autoFocus
            />
            <div className="flex justify-end mt-2 space-x-1">
              <button 
                className="p-1 rounded text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                onClick={handleCreateGroup}
                title="Create"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button 
                className="p-1 rounded text-xs bg-red-600 text-white hover:bg-red-700 transition-colors"
                onClick={() => {
                  setIsCreating(false);
                  setNewGroupName('');
                }}
                title="Cancel"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        <div className="mt-1 px-2">
          {groups.map(group => (
            <div 
              key={group.id}
              className={`flex items-center px-2 py-1.5 rounded-md mb-1 cursor-pointer transition-colors ${
                currentGroupId === group.id 
                  ? 'bg-indigo-900/30 text-indigo-300' 
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
              onClick={() => onSelectGroup(group.id)}
            >
              <span className="mr-2 opacity-70">📁</span>
              <span className="flex-1 truncate text-sm">{group.name}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-400">
                {group.boardIds?.length || 0}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="px-2 py-2 border-t border-gray-800">
        <div className="flex items-center px-3 py-2 rounded-md text-gray-400 hover:bg-gray-800 hover:text-gray-200 cursor-pointer transition-colors">
          <span className="mr-2">⚙️</span>
          <span className="text-sm">Settings</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;