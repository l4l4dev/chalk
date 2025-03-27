import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TaskDetailView from './TaskDetailView';
import SearchAndFilterBar from './SearchAndFilterBar';
import EnhancedTaskCard from './EnhancedTaskCard';
import WorkspacePanel from './WorkspacePanel';
import CalendarView from './calendar/CalendarView';
import DocumentationSystem from './DocumentationSystem';

const BoardView = ({ 
  board, 
  columns, 
  getTasks, 
  onCreateColumn, 
  onCreateTask, 
  onMoveTask,
  onUpdateTask,
  onDeleteTask,
  onBack,
  workspaceItems = [],
  onCreateWorkspaceItem,
  onUpdateWorkspaceItem,
  onDeleteWorkspaceItem
}) => {
  const [newColumnName, setNewColumnName] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newTaskContents, setNewTaskContents] = useState({});
  const [expandedTaskInputs, setExpandedTaskInputs] = useState({});
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [filters, setFilters] = useState({
    priority: 'all',
    completed: 'all',
    dueDate: 'any',
    labels: []
  });
  const [isWorkspacePanelVisible, setIsWorkspacePanelVisible] = useState(false);
  
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'calendar'
  
  const newColumnInputRef = useRef(null);
  
  const availableLabels = useMemo(() => {
    const labelsSet = new Set();
    
    columns.forEach(column => {
      const tasks = getTasks(column.id);
      tasks.forEach(task => {
        if (task.labels && Array.isArray(task.labels)) {
          task.labels.forEach(label => labelsSet.add(label));
        }
      });
    });
    
    return Array.from(labelsSet);
  }, [columns, getTasks]);
  
  const applySearchAndFilters = useCallback((task, term, appliedFilters) => {
    if (term) {
      const lowerCaseTerm = term.toLowerCase();
      if (!task.content.toLowerCase().includes(lowerCaseTerm) && 
          !(task.description && task.description.toLowerCase().includes(lowerCaseTerm))) {
        return false;
      }
    }
    
    if (appliedFilters.priority !== 'all' && task.priority !== appliedFilters.priority) {
      return false;
    }
    
    if (appliedFilters.completed === 'completed' && !task.completed) {
      return false;
    } else if (appliedFilters.completed === 'active' && task.completed) {
      return false;
    }
    
    if (appliedFilters.dueDate !== 'any') {
      if (!task.dueDate) return false;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      if (appliedFilters.dueDate === 'overdue') {
        return dueDate < today && !task.completed;
      }
      
      if (appliedFilters.dueDate === 'today') {
        return dueDate.getTime() === today.getTime();
      }
      
      if (appliedFilters.dueDate === 'week') {
        const weekFromNow = new Date();
        weekFromNow.setDate(today.getDate() + 7);
        return dueDate >= today && dueDate <= weekFromNow;
      }
      
      if (appliedFilters.dueDate === 'month') {
        const monthFromNow = new Date();
        monthFromNow.setMonth(today.getMonth() + 1);
        return dueDate >= today && dueDate <= monthFromNow;
      }
    }
    
    if (appliedFilters.labels.length > 0) {
      if (!task.labels || !Array.isArray(task.labels)) return false;
      return appliedFilters.labels.some(label => task.labels.includes(label));
    }
    
    return true;
  }, []);
  
  useEffect(() => {
    if (isAddingColumn && newColumnInputRef.current) {
      newColumnInputRef.current.focus();
    }
  }, [isAddingColumn]);
  
  const handleCreateColumn = useCallback(() => {
    if (newColumnName.trim()) {
      onCreateColumn(newColumnName.trim());
      setNewColumnName('');
      setIsAddingColumn(false);
    }
  }, [newColumnName, onCreateColumn]);
  
  const handleCreateTask = useCallback((columnId, content, details = {}) => {
    if (!content) {
      content = newTaskContents[columnId];
    }
    
    if (content && content.trim()) {
      onCreateTask(columnId, content.trim(), details);
      setNewTaskContents(prev => ({
        ...prev,
        [columnId]: ''
      }));
      setExpandedTaskInputs(prev => ({
        ...prev,
        [columnId]: false
      }));
    }
  }, [newTaskContents, onCreateTask]);
  
  const handleDragEnd = useCallback((result) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) return;
    
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    onMoveTask(draggableId, source.droppableId, destination.droppableId, source.index, destination.index);
  }, [onMoveTask]);

  const toggleTaskInput = useCallback((columnId) => {
    setExpandedTaskInputs(prev => {
      const newState = {
        ...prev,
        [columnId]: !prev[columnId]
      };
      
      if (!newState[columnId]) return newState;
      
      setNewTaskContents(prevContents => ({
        ...prevContents,
        [columnId]: prevContents[columnId] || ''
      }));
      
      return newState;
    });
  }, []);
  
  const handleKeyDown = useCallback((e, columnId) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreateTask(columnId);
    } else if (e.key === 'Escape') {
      setNewTaskContents(prev => ({
        ...prev,
        [columnId]: ''
      }));
      setExpandedTaskInputs(prev => ({
        ...prev,
        [columnId]: false
      }));
    }
  }, [handleCreateTask]);
  
  const handleColumnKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleCreateColumn();
    } else if (e.key === 'Escape') {
      setIsAddingColumn(false);
      setNewColumnName('');
    }
  }, [handleCreateColumn]);
  
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);
  
  const handleFilter = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const toggleWorkspacePanel = useCallback(() => {
    setIsWorkspacePanelVisible(prev => !prev);
  }, []);
  
  const getFilteredTasks = useMemo(() => {
    return (columnId) => {
      let tasks = getTasks(columnId);
      
      if (!searchTerm && filters.priority === 'all' && filters.completed === 'all' && 
          filters.dueDate === 'any' && filters.labels.length === 0) {
        return tasks;
      }
      
      return tasks.filter(task => applySearchAndFilters(task, searchTerm, filters));
    };
  }, [getTasks, searchTerm, filters, applySearchAndFilters]);
  
  const formatDate = useCallback((dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  const isOverdue = useCallback((dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  }, []);
  
  const getPriorityClasses = useCallback((priority) => {
    switch(priority) {
      case 'high': return 'border-red-500 neon-border-high neon-pulse';
      case 'medium': return 'border-amber-500 neon-border-medium';
      case 'low': return 'border-emerald-500 neon-border-low';
      default: return 'border-transparent';
    }
  }, []);
  
  const hasActiveFilters = useMemo(() => 
    searchTerm.trim() !== '' || 
    filters.priority !== 'all' || 
    filters.completed !== 'all' || 
    filters.dueDate !== 'any' || 
    filters.labels.length > 0
  , [searchTerm, filters]);
  
  const totalTasks = useMemo(() => 
    columns.reduce((count, column) => count + getTasks(column.id).length, 0)
  , [columns, getTasks]);
  
  const filteredTasksCount = useMemo(() => 
    columns.reduce((count, column) => count + getFilteredTasks(column.id).length, 0)
  , [columns, getFilteredTasks]);
  
  const handleTaskClick = useCallback((taskId) => {
    setSelectedTaskId(taskId);
  }, []);
  
  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return null;
    
    for (const column of columns) {
      const tasks = getTasks(column.id);
      const task = tasks.find(t => t.id === selectedTaskId);
      if (task) return task;
    }
    return null;
  }, [columns, getTasks, selectedTaskId]);
  
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setFilters({
      priority: 'all',
      completed: 'all',
      dueDate: 'any',
      labels: []
    });
  }, []);
  
  const toggleViewMode = useCallback((mode) => {
    setViewMode(mode);
  }, []);
  
  const toggleDocumentation = useCallback(() => {
    setShowDocumentation(prev => !prev);
  }, []);
  
  const handleCloseTaskDetail = useCallback(() => {
    setSelectedTaskId(null);
  }, []);
  
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center px-6 py-4 border-b border-gray-800">
        <button 
          className="p-2 mr-4 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors focus:outline-none"
          onClick={onBack}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h2 className="text-xl font-bold text-white">{board.name}</h2>
        
        <div className="ml-6 flex bg-gray-800 rounded-md overflow-hidden">
          <button 
            className={`px-3 py-1.5 text-sm transition-colors ${
              viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => toggleViewMode('kanban')}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Kanban</span>
            </div>
          </button>
          <button 
            className={`px-3 py-1.5 text-sm transition-colors ${
              viewMode === 'calendar' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => toggleViewMode('calendar')}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span>Calendar</span>
            </div>
          </button>
        </div>

        <button 
            className={`ml-4 px-3 py-1.5 text-sm rounded-md focus:outline-none transition-colors ${
              showDocumentation 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={toggleDocumentation}
            title={showDocumentation ? "Hide Docs" : "Show Docs"}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              <span>Documentation</span>
            </div>
          </button>
        
          <button 
            className={`ml-2 sm:ml-4 p-2 sm:px-3 sm:py-1.5 text-sm rounded-md focus:outline-none transition-colors ${
              isWorkspacePanelVisible 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={toggleWorkspacePanel}
            title={isWorkspacePanelVisible ? "Hide Workspace" : "Show Workspace"}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="hidden sm:inline">Workspace</span>
            </div>
          </button>
      </div>
      
      {board.description && (
        <div className="px-6 py-2 text-gray-400 text-sm">
          <p>{board.description}</p>
        </div>
      )}
      
      <div className="px-6 py-3 border-b border-gray-800">
        <SearchAndFilterBar 
          onSearch={handleSearch} 
          onFilter={handleFilter}
          availableLabels={availableLabels}
          showAdvancedFilters={true}
        />
        
        {hasActiveFilters && (
          <div className="mt-2 text-xs text-gray-400 flex items-center justify-between">
            <span>
              Showing {filteredTasksCount} of {totalTasks} tasks
            </span>
            
            <button 
              className="text-indigo-400 hover:text-indigo-300"
              onClick={handleClearFilters}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {showDocumentation ? (
          <div className="flex-1 overflow-auto p-4">
            <DocumentationSystem
              workspaceItems={workspaceItems}
              tasks={columns.reduce((allTasks, column) => [...allTasks, ...getTasks(column.id)], [])}
              onCreateDocument={(type, content, metadata) => onCreateWorkspaceItem(type, content, {
                ...metadata, 
                boardId: board.id
              })}
              onUpdateDocument={onUpdateWorkspaceItem}
              onLinkTaskToDocument={(docId, taskId) => {
                const task = columns.reduce((foundTask, column) => {
                  if (foundTask) return foundTask;
                  const columnTasks = getTasks(column.id);
                  return columnTasks.find(t => t.id === taskId) || null;
                }, null);
                
                if (!task) return;
                
                const doc = workspaceItems.find(item => item.id === docId);
                if (!doc) return;
                
                const linkedDocs = task.linkedDocuments || [];
                if (!linkedDocs.includes(docId)) {
                  onUpdateTask(taskId, {
                    linkedDocuments: [...linkedDocs, docId]
                  });
                }
                
                const linkedTasks = doc.linkedTasks || [];
                if (!linkedTasks.includes(taskId)) {
                  onUpdateWorkspaceItem(docId, {
                    linkedTasks: [...linkedTasks, taskId]
                  });
                }
              }}
              currentBoardId={board.id}
            />
          </div>
        ) : viewMode === 'kanban' ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className={`flex-1 overflow-x-auto p-4 ${isWorkspacePanelVisible ? 'pr-0' : ''}`}>
              <div className="flex h-full">
                {columns.map(column => {
                  const tasks = hasActiveFilters ? getFilteredTasks(column.id) : getTasks(column.id);
                  const isTaskInputExpanded = expandedTaskInputs[column.id];
                  
                  return (
                      <div key={column.id} className="flex flex-col min-w-[280px] w-[300px] md:w-[280px] lg:w-[300px] flex-shrink-0 mr-4 bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-white">{column.name}</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300">
                            {tasks.length}
                          </span>
                        </div>
                        <div className="text-gray-500">
                        </div>
                      </div>
                      
                      <Droppable droppableId={column.id}>
                        {(provided, snapshot) => (
                          <div
                            className={`flex-1 overflow-y-auto p-2 ${snapshot.isDraggingOver ? 'bg-gray-700 bg-opacity-30' : ''} transition-colors duration-200`}
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {tasks.length === 0 && !snapshot.isDraggingOver && (
                              <div className="flex items-center justify-center h-24 border border-dashed border-gray-700 rounded-md m-1">
                                <p className="text-gray-500 text-sm">{
                                  hasActiveFilters ? 'No matching tasks' : 'No tasks yet'
                                }</p>
                              </div>
                            )}
                            
                            {tasks.map((task, index) => (
                              <Draggable
                                key={task.id}
                                draggableId={task.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <EnhancedTaskCard
                                    task={task}
                                    index={index}
                                    provided={provided}
                                    snapshot={snapshot}
                                    onClick={(e) => {
                                      if (!e.defaultPrevented) {
                                        setSelectedTaskId(task.id);
                                      }
                                    }}
                                    getPriorityClasses={getPriorityClasses}
                                    formatDate={formatDate}
                                    isOverdue={isOverdue}
                                  />
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                      
                      <div className="p-3 border-t border-gray-700">
                        {!isTaskInputExpanded ? (
                          <button 
                            className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white py-2 px-3 bg-gray-700 bg-opacity-50 hover:bg-opacity-70 rounded-md transition-colors btn-neon"
                            onClick={() => toggleTaskInput(column.id)}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Add task</span>
                          </button>
                        ) : (
                          <div className="p-3 bg-gray-900 rounded-md border border-gray-700">
                            <textarea
                              value={newTaskContents[column.id] || ''}
                              onChange={(e) => setNewTaskContents({
                                ...newTaskContents,
                                [column.id]: e.target.value
                              })}
                              placeholder="What needs to be done?"
                              onKeyDown={(e) => handleKeyDown(e, column.id)}
                              rows="3"
                              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                              autoFocus
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors btn-neon btn-neon-primary"
                                onClick={() => handleCreateTask(column.id)}
                                disabled={!newTaskContents[column.id] || !newTaskContents[column.id].trim()}
                              >
                                Add
                              </button>
                              <button
                                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md focus:outline-none transition-colors"
                                onClick={() => toggleTaskInput(column.id)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {!isAddingColumn ? (
                  <div className="min-w-[280px] w-[300px] md:w-[280px] lg:w-[300px] flex-shrink-0">
                    <button 
                      className="w-full h-12 flex items-center justify-center gap-2 text-gray-400 hover:text-white bg-gray-800 bg-opacity-30 hover:bg-opacity-50 border border-gray-700 border-dashed rounded-lg transition-colors"
                      onClick={() => setIsAddingColumn(true)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Add Column</span>
                    </button>
                  </div>
                ) : (
                  <div className="min-w-[280px] w-[300px] md:w-[280px] lg:w-[300px] flex-shrink-0 p-4 bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
                    <input
                      type="text"
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      placeholder="Column name"
                      onKeyDown={handleColumnKeyDown}
                      ref={newColumnInputRef}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-3"
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors"
                        onClick={handleCreateColumn}
                        disabled={!newColumnName.trim()}
                      >
                        Add
                      </button>
                      <button 
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md focus:outline-none transition-colors"
                        onClick={() => {
                          setIsAddingColumn(false);
                          setNewColumnName('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DragDropContext>
        ) : (
          <div className={`flex-1 overflow-hidden ${isWorkspacePanelVisible ? 'pr-0' : ''}`}>
            <CalendarView
              columns={columns}
              getTasks={getTasks}
              searchTerm={searchTerm}
              filters={filters}
              applySearchAndFilters={applySearchAndFilters}
              onCreateTask={handleCreateTask}
              onTaskClick={handleTaskClick}
            />
          </div>
        )}
        
        {isWorkspacePanelVisible && (
            <div className="w-full md:w-80 md:min-w-80 h-full border-t md:border-t-0 md:border-l border-gray-700">
            <WorkspacePanel
              board={board}
              workspaceItems={workspaceItems}
              onCreateItem={onCreateWorkspaceItem}
              onUpdateItem={onUpdateWorkspaceItem}
              onDeleteItem={onDeleteWorkspaceItem}
            />
          </div>
        )}
      </div>
      
      {selectedTaskId && (
        <TaskDetailView
          task={selectedTask}
          onClose={handleCloseTaskDetail}
          onUpdate={onUpdateTask}
          onDelete={onDeleteTask}
        />
      )}
    </div>
  );
};

export default React.memo(BoardView);