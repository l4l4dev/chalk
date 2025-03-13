// src/components/SearchTasksView.js
import React, { useState, useEffect } from 'react';
import SearchAndFilterBar from './SearchAndFilterBar';

const SearchTasksView = ({ 
  groups, 
  getBoards, 
  getColumns, 
  getTasks,
  onBack,
  onTaskClick
}) => {
  const [searchResults, setSearchResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    priority: 'all',
    completed: 'all',
    dueDate: 'any',
    labels: []
  });
  const [availableLabels, setAvailableLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Collect all tasks and available labels on component mount
  useEffect(() => {
    collectTasksAndLabels();
  }, [groups]);
  
  // Gather all tasks from all groups, boards, columns
  const collectTasksAndLabels = () => {
    setIsLoading(true);
    
    const allTasks = [];
    const labelsSet = new Set();
    
    groups.forEach(group => {
      const boards = getBoards(group.id);
      
      boards.forEach(board => {
        const columns = getColumns(board.id);
        
        columns.forEach(column => {
          const tasks = getTasks(column.id);
          
          tasks.forEach(task => {
            // Collect labels
            if (task.labels && Array.isArray(task.labels)) {
              task.labels.forEach(label => labelsSet.add(label));
            }
            
            // Add task with contextual information
            allTasks.push({
              ...task,
              groupId: group.id,
              groupName: group.name,
              boardId: board.id,
              boardName: board.name,
              columnId: column.id,
              columnName: column.name
            });
          });
        });
      });
    });
    
    setSearchResults(allTasks);
    setFilteredResults(allTasks);
    setAvailableLabels(Array.from(labelsSet));
    setIsLoading(false);
  };
  
  // Handle search input changes
  const handleSearch = (term) => {
    setSearchTerm(term);
    applySearchAndFilters(term, filters);
  };
  
  // Handle filter changes
  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    applySearchAndFilters(searchTerm, newFilters);
  };
  
  // Apply both search term and filters
  const applySearchAndFilters = (term, appliedFilters) => {
    const lowerCaseTerm = term.toLowerCase();
    
    const filtered = searchResults.filter(task => {
      // Text search
      const matchesSearch = 
        !term || 
        task.content.toLowerCase().includes(lowerCaseTerm) || 
        (task.description && task.description.toLowerCase().includes(lowerCaseTerm));
      
      if (!matchesSearch) return false;
      
      // Priority filter
      if (appliedFilters.priority !== 'all' && task.priority !== appliedFilters.priority) {
        return false;
      }
      
      // Completion status filter
      if (appliedFilters.completed === 'completed' && !task.completed) {
        return false;
      }
      if (appliedFilters.completed === 'active' && task.completed) {
        return false;
      }
      
      // Due date filter
      if (appliedFilters.dueDate !== 'any' && task.dueDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        if (appliedFilters.dueDate === 'overdue' && dueDate >= today) {
          return false;
        }
        
        if (appliedFilters.dueDate === 'today') {
          if (dueDate.getTime() !== today.getTime()) {
            return false;
          }
        }
        
        if (appliedFilters.dueDate === 'week') {
          const weekFromNow = new Date();
          weekFromNow.setDate(today.getDate() + 7);
          
          if (dueDate < today || dueDate > weekFromNow) {
            return false;
          }
        }
        
        if (appliedFilters.dueDate === 'month') {
          const monthFromNow = new Date();
          monthFromNow.setMonth(today.getMonth() + 1);
          
          if (dueDate < today || dueDate > monthFromNow) {
            return false;
          }
        }
      } else if (appliedFilters.dueDate !== 'any' && !task.dueDate) {
        return false;
      }
      
      // Labels filter
      if (appliedFilters.labels.length > 0) {
        if (!task.labels || !Array.isArray(task.labels)) {
          return false;
        }
        
        // Check if task has at least one of the selected labels
        const hasMatchingLabel = appliedFilters.labels.some(label => 
          task.labels.includes(label)
        );
        
        if (!hasMatchingLabel) {
          return false;
        }
      }
      
      return true;
    });
    
    setFilteredResults(filtered);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Check if a task is overdue
  const isOverdue = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };
  
  // Get task priority styling
  const getPriorityClasses = (priority) => {
    switch(priority) {
      case 'high': return 'border-red-500';
      case 'medium': return 'border-amber-500';
      case 'low': return 'border-emerald-500';
      default: return 'border-transparent';
    }
  };
  
  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* Header */}
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
        <h2 className="text-xl font-bold text-white">Search Tasks</h2>
      </div>
      
      {/* Search and filter bar */}
      <div className="mb-6">
        <SearchAndFilterBar 
          onSearch={handleSearch}
          onFilter={handleFilter}
          availableLabels={availableLabels}
          showAdvancedFilters={true}
        />
      </div>
      
      {/* Search results */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-4 py-3 bg-gray-900 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-white font-medium">
            {isLoading ? 'Loading tasks...' : `${filteredResults.length} tasks found`}
          </h3>
          
          <div className="text-xs text-gray-400">
            {searchTerm ? `Searching for "${searchTerm}"` : 'All tasks'}
          </div>
        </div>
        
        {/* Results list */}
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="w-8 h-8 border-2 border-t-indigo-500 border-gray-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-700">
            {filteredResults.length === 0 ? (
              <li className="p-6 text-center text-gray-500">
                <p>No tasks found matching your search criteria</p>
                <button 
                  className="mt-3 text-indigo-400 hover:text-indigo-300 text-sm"
                  onClick={() => {
                    setSearchTerm('');
                    handleSearch('');
                    handleFilter({
                      priority: 'all',
                      completed: 'all',
                      dueDate: 'any',
                      labels: []
                    });
                  }}
                >
                  Clear all filters
                </button>
              </li>
            ) : (
              filteredResults.map(task => (
                <li 
                  key={task.id} 
                  className={`p-4 bg-gray-800 hover:bg-gray-750 cursor-pointer border-l-4 ${getPriorityClasses(task.priority)}`}
                  onClick={() => onTaskClick(task)}
                >
                  <div className="flex items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 mr-2 rounded border border-gray-600 flex-shrink-0 ${
                          task.completed ? 'bg-emerald-600 border-emerald-600' : ''
                        }`}>
                          {task.completed && (
                            <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <h4 className={`text-sm font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                          {task.content}
                        </h4>
                      </div>
                      
                      {/* Task details */}
                      <div className="mt-2 text-xs text-gray-400 pl-6">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Location info */}
                          <div className="flex items-center">
                            <span className="bg-gray-700 px-2 py-0.5 rounded">
                              {task.boardName} / {task.columnName}
                            </span>
                          </div>
                          
                          {/* Due date */}
                          {task.dueDate && (
                            <div className={`flex items-center gap-1 ${isOverdue(task.dueDate) && !task.completed ? 'text-red-400' : ''}`}>
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span>{formatDate(task.dueDate)}</span>
                            </div>
                          )}
                          
                          {/* Priority */}
                          <div className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${
                              task.priority === 'high' ? 'bg-red-500' : 
                              task.priority === 'medium' ? 'bg-amber-500' : 
                              'bg-emerald-500'
                            }`}></span>
                            <span className="capitalize">{task.priority}</span>
                          </div>
                        </div>
                        
                        {/* Labels */}
                        {task.labels && task.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {task.labels.map((label, index) => (
                              <span key={index} className="px-2 py-0.5 bg-indigo-900 bg-opacity-40 text-indigo-300 rounded-full">
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Description preview */}
                        {task.description && (
                          <div className="mt-2 text-gray-500 line-clamp-1">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchTasksView;