// src/components/BoardView.js with toggle between Kanban and Calendar views
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TaskDetailView from './TaskDetailView';
import SearchAndFilterBar from './SearchAndFilterBar';
import EnhancedTaskCard from './EnhancedTaskCard';
import WorkspacePanel from './WorkspacePanel'; 

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
  const [filters, setFilters] = useState({
    priority: 'all',
    completed: 'all',
    dueDate: 'any',
    labels: []
  });
  const [isWorkspacePanelVisible, setIsWorkspacePanelVisible] = useState(false);
  
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'calendar'
  
  const [calendarView, setCalendarView] = useState('month'); // 'month', 'week', 'day'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateTaskMap, setDateTaskMap] = useState({});
  const [quickAddDate, setQuickAddDate] = useState(null);
  const [quickAddContent, setQuickAddContent] = useState('');
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  
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
  
  useEffect(() => {
    if (viewMode === 'calendar') {
      const allTasks = [];
      columns.forEach(column => {
        const tasks = getTasks(column.id).filter(task => 
          applySearchAndFilters(task, searchTerm, filters) && !task.completed
        );
        
        tasks.forEach(task => {
          allTasks.push({
            ...task,
            columnName: column.name
          });
        });
      });
      
      groupTasksByDate(allTasks);
    }
  }, [viewMode, columns, getTasks, searchTerm, filters]);
  
  const groupTasksByDate = (taskList) => {
    const map = {};
    
    taskList.forEach(task => {
      if (task.dueDate) {
        const dateKey = new Date(task.dueDate).toISOString().split('T')[0];
        if (!map[dateKey]) {
          map[dateKey] = [];
        }
        map[dateKey].push(task);
      }
    });
    
    setDateTaskMap(map);
  };
  
  const applySearchAndFilters = (task, term, appliedFilters) => {
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
  };
  
  useEffect(() => {
    if (isAddingColumn && newColumnInputRef.current) {
      newColumnInputRef.current.focus();
    }
  }, [isAddingColumn]);
  
  const handleCreateColumn = () => {
    if (newColumnName.trim()) {
      onCreateColumn(newColumnName.trim());
      setNewColumnName('');
      setIsAddingColumn(false);
    }
  };
  
  const handleCreateTask = (columnId, content, details = {}) => {
    if (!content) {
      content = newTaskContents[columnId];
    }
    
    if (content && content.trim()) {
      onCreateTask(columnId, content.trim(), details);
      setNewTaskContents({
        ...newTaskContents,
        [columnId]: ''
      });
      setExpandedTaskInputs({
        ...expandedTaskInputs,
        [columnId]: false
      });
    }
  };
  
  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) return;
    
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    onMoveTask(draggableId, source.droppableId, destination.droppableId, source.index, destination.index);
  };

  const toggleTaskInput = (columnId) => {
    setExpandedTaskInputs({
      ...expandedTaskInputs,
      [columnId]: !expandedTaskInputs[columnId]
    });
    
    if (!newTaskContents[columnId]) {
      setNewTaskContents({
        ...newTaskContents,
        [columnId]: ''
      });
    }
  };
  
  const handleKeyDown = (e, columnId) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreateTask(columnId);
    } else if (e.key === 'Escape') {
      setNewTaskContents({
        ...newTaskContents,
        [columnId]: ''
      });
      setExpandedTaskInputs({
        ...expandedTaskInputs,
        [columnId]: false
      });
    }
  };
  
  const handleColumnKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCreateColumn();
    } else if (e.key === 'Escape') {
      setIsAddingColumn(false);
      setNewColumnName('');
    }
  };
  
  const handleSearch = (term) => {
    setSearchTerm(term);
  };
  
  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  const toggleWorkspacePanel = () => {
    setIsWorkspacePanelVisible(!isWorkspacePanelVisible);
  };
  
  const getFilteredTasks = (columnId) => {
    let tasks = getTasks(columnId);
    
    if (!searchTerm && filters.priority === 'all' && filters.completed === 'all' && 
        filters.dueDate === 'any' && filters.labels.length === 0) {
      return tasks;
    }
    
    return tasks.filter(task => applySearchAndFilters(task, searchTerm, filters));
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };
  
  const getPriorityClasses = (priority) => {
    switch(priority) {
      case 'high': return 'border-red-500 neon-border-high neon-pulse';
      case 'medium': return 'border-amber-500 neon-border-medium';
      case 'low': return 'border-emerald-500 neon-border-low';
      default: return 'border-transparent';
    }
  };
  
  const hasActiveFilters = 
    searchTerm.trim() !== '' || 
    filters.priority !== 'all' || 
    filters.completed !== 'all' || 
    filters.dueDate !== 'any' || 
    filters.labels.length > 0;
    
  const totalTasks = columns.reduce((count, column) => {
    return count + getTasks(column.id).length;
  }, 0);
  
  const filteredTasksCount = columns.reduce((count, column) => {
    return count + getFilteredTasks(column.id).length;
  }, 0);
  
  const handleCalendarPrevious = () => {
    const newDate = new Date(currentDate);
    
    if (calendarView === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (calendarView === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    }
    
    setCurrentDate(newDate);
  };
  
  const handleCalendarNext = () => {
    const newDate = new Date(currentDate);
    
    if (calendarView === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (calendarView === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    }
    
    setCurrentDate(newDate);
  };
  
  const handleCalendarToday = () => {
    setCurrentDate(new Date());
  };
  
  const handleSelectDate = (date) => {
    setSelectedDate(date);
  };
  
  const handleQuickAddTask = (date) => {
    setQuickAddDate(date);
    setQuickAddContent('');
    setShowQuickAddModal(true);
  };
  
  const handleCreateQuickTask = () => {
    if (quickAddContent.trim() && quickAddDate && columns.length > 0) {
      const firstColumnId = columns[0].id;
      
      const dateString = quickAddDate.toISOString().split('T')[0];
      onCreateTask(firstColumnId, quickAddContent.trim(), {
        dueDate: dateString
      });
      
      setShowQuickAddModal(false);
      setQuickAddContent('');
      setQuickAddDate(null);
    }
  };
  
  const getMonthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay(); // 0 is Sunday
    
    const lastDay = new Date(year, month + 1, 0);
    const lastDate = lastDay.getDate();
    
    const daysNeededBefore = firstDayOfWeek;
    const totalDaysInMonth = lastDate;
    const totalCells = daysNeededBefore + totalDaysInMonth;
    const rows = Math.ceil(totalCells / 7);
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    const days = [];
    
    for (let i = daysNeededBefore - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const date = new Date(year, month - 1, dayNum);
      days.push({
        date,
        dayOfMonth: dayNum,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
        dateString: date.toISOString().split('T')[0]
      });
    }
    
    for (let i = 1; i <= lastDate; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        dayOfMonth: i,
        isCurrentMonth: true,
        isToday: isSameDay(date, new Date()),
        dateString: date.toISOString().split('T')[0]
      });
    }
    
    const remainingCells = rows * 7 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        dayOfMonth: i,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
        dateString: date.toISOString().split('T')[0]
      });
    }
    
    return { days, rows };
  }, [currentDate]);
  
  const getWeekData = useMemo(() => {
    const date = new Date(currentDate);
    const day = date.getDay(); // 0 is Sunday
    
    date.setDate(date.getDate() - day);
    
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(date);
      days.push({
        date: currentDay,
        dayOfMonth: currentDay.getDate(),
        isCurrentMonth: currentDay.getMonth() === currentDate.getMonth(),
        isToday: isSameDay(currentDay, new Date()),
        dateString: currentDay.toISOString().split('T')[0]
      });
      date.setDate(date.getDate() + 1);
    }
    
    return { days };
  }, [currentDate]);
  
  const getDayData = useMemo(() => {
    const date = new Date(currentDate);
    return {
      date,
      dayOfMonth: date.getDate(),
      isCurrentMonth: true,
      isToday: isSameDay(date, new Date()),
      dateString: date.toISOString().split('T')[0]
    };
  }, [currentDate]);
  
  function isSameDay(date1, date2) {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }
  
  const getTasksForDate = (dateString) => {
    return dateTaskMap[dateString] || [];
  };
  
  const formatCalendarDate = (date, format = 'long') => {
    if (format === 'long') {
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric'
      });
    } else if (format === 'week') {
      const start = getWeekData.days ? getWeekData.days[0].date : new Date();
      const end = getWeekData.days ? getWeekData.days[6].date : new Date();
      
      if (start.getMonth() === end.getMonth()) {
        return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
      } else {
        return `${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getDate()} - ${end.toLocaleDateString('en-US', { month: 'short' })} ${end.getDate()}, ${end.getFullYear()}`;
      }
    } else if (format === 'day') {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
    
    return date.toLocaleDateString();
  };
  
  const getTasksWithoutDueDates = () => {
    const tasksWithoutDates = [];
    
    columns.forEach(column => {
      const tasks = getTasks(column.id).filter(task => 
        !task.dueDate && 
        applySearchAndFilters(task, searchTerm, filters) && 
        !task.completed 
      );
      
      tasks.forEach(task => {
        tasksWithoutDates.push({
          ...task,
          columnName: column.name
        });
      });
    });
    
    return tasksWithoutDates;
  };
  
  const renderCalendarView = () => {
    if (calendarView === 'month') {
      const { days, rows } = getMonthData;
      const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      return (
        <div className="bg-gray-850 rounded-lg border border-gray-700 overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-800 border-b border-gray-700">
            {weekDays.map((day, i) => (
              <div key={i} className="py-2 text-center text-sm font-medium text-gray-400">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 grid-rows-{rows}" style={{ gridTemplateRows: `repeat(${rows}, minmax(120px, 1fr))` }}>
            {days.map((day, i) => (
              <div 
                key={i}
                className={`min-h-[120px] border-b border-r border-gray-700 p-1 relative group ${
                  day.isCurrentMonth ? 'bg-gray-800' : 'bg-gray-900 opacity-60'
                } ${
                  day.isToday ? 'ring-1 ring-inset ring-indigo-500' : ''
                } ${
                  selectedDate && isSameDay(selectedDate, day.date) ? 'bg-indigo-900/30' : ''
                }`}
                onClick={() => handleSelectDate(day.date)}
              >
                <div className="flex justify-between items-start">
                  <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-sm ${
                    day.isToday 
                      ? 'bg-indigo-600 text-white font-medium' 
                      : day.isCurrentMonth ? 'text-white' : 'text-gray-500'
                  }`}>
                    {day.dayOfMonth}
                  </span>
                  
                  {getTasksForDate(day.dateString).length > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-900 text-indigo-300">
                      {getTasksForDate(day.dateString).length}
                    </span>
                  )}
                </div>
                
                <div className="mt-1 space-y-1 max-h-[90px] overflow-hidden">
                  {getTasksForDate(day.dateString).slice(0, 3).map((task, idx) => (
                    <div 
                      key={idx}
                      className={`text-xs p-1 rounded truncate border-l-2 cursor-pointer ${getPriorityClasses(task.priority)} text-white bg-gray-750`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTaskId(task.id);
                      }}
                    >
                      {task.content}
                    </div>
                  ))}
                  
                  {getTasksForDate(day.dateString).length > 3 && (
                    <div className="text-xs text-gray-400 pl-1">
                      +{getTasksForDate(day.dateString).length - 3} more
                    </div>
                  )}
                </div>
                
                {day.isCurrentMonth && (
                  <div 
                    className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-indigo-600 
                              flex items-center justify-center cursor-pointer opacity-0 
                              group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickAddTask(day.date);
                    }}
                  >
                    <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 5v10M5 10h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    } else if (calendarView === 'week') {
      const { days } = getWeekData;
      const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      return (
        <div className="bg-gray-850 rounded-lg border border-gray-700 overflow-hidden">
          {/* Week Header */}
          <div className="grid grid-cols-7 bg-gray-800 border-b border-gray-700">
            {days.map((day, i) => (
              <div key={i} className={`py-2 text-center ${day.isToday ? 'bg-indigo-900/30' : ''}`}>
                <div className="text-sm font-medium text-gray-400">
                  {weekDays[i]}
                </div>
                <div className={`text-lg font-medium ${day.isToday ? 'text-indigo-400' : 'text-white'}`}>
                  {day.dayOfMonth}
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 min-h-[500px]">
            {days.map((day, i) => (
              <div 
                key={i}
                className={`border-r border-gray-700 p-2 ${
                  day.isToday ? 'bg-indigo-900/10' : 'bg-gray-800'
                } ${
                  selectedDate && isSameDay(selectedDate, day.date) ? 'bg-indigo-900/30' : ''
                }`}
                onClick={() => handleSelectDate(day.date)}
              >
                <div className="space-y-2 h-full overflow-y-auto">
                  {getTasksForDate(day.dateString).map((task, idx) => (
                    <div 
                      key={idx}
                      className={`p-2 rounded border-l-2 cursor-pointer ${getPriorityClasses(task.priority)} text-white bg-gray-750`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTaskId(task.id);
                      }}
                    >
                      <div className="text-sm font-medium truncate">{task.content}</div>
                      <div className="text-xs text-gray-400 mt-1">{task.columnName}</div>
                      
                      {task.labels && task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {task.labels.slice(0, 2).map((label, labelIdx) => (
                            <span key={labelIdx} className="px-1.5 py-0.5 bg-indigo-900/50 text-indigo-300 rounded text-xs">
                              {label}
                            </span>
                          ))}
                          {task.labels.length > 2 && (
                            <span className="px-1.5 py-0.5 bg-gray-700 text-gray-400 rounded text-xs">
                              +{task.labels.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else if (calendarView === 'day') {
      const day = getDayData;
      
      return (
        <div className="bg-gray-850 rounded-lg border border-gray-700 overflow-hidden">
          <div className="bg-gray-800 border-b border-gray-700 p-4 text-center">
            <div className={`text-lg font-medium ${day.isToday ? 'text-indigo-400' : 'text-white'}`}>
              {day.dayOfMonth}
            </div>
            <div className="text-sm text-gray-400">
              {formatCalendarDate(day.date, 'day')}
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="text-white font-medium mb-3">Tasks for this day</h3>
            
            {getTasksForDate(day.dateString).length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-800 rounded-md border border-gray-700">
                No tasks scheduled for this day
              </div>
            ) : (
              <div className="space-y-3">
                {getTasksForDate(day.dateString).map((task, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded border-l-2 cursor-pointer ${getPriorityClasses(task.priority)} ${
                      task.completed ? 'line-through text-gray-500 bg-gray-800/50' : 'text-white bg-gray-750'
                    }`}
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    <div className="text-sm font-medium">{task.content}</div>
                    
                    {task.description && (
                      <div className="text-sm text-gray-400 mt-1 line-clamp-2">{task.description}</div>
                    )}
                    
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                      <div>{task.columnName}</div>
                      
                      <div className="flex items-center space-x-2">
                        {task.priority && (
                          <span className={`px-2 py-0.5 rounded-full ${
                            task.priority === 'high' ? 'bg-red-900/50 text-red-300' :
                            task.priority === 'medium' ? 'bg-amber-900/50 text-amber-300' :
                            'bg-emerald-900/50 text-emerald-300'
                          }`}>
                            {task.priority}
                          </span>
                        )}
                        
                        {task.completed && (
                          <span className="px-2 py-0.5 bg-emerald-900/50 text-emerald-300 rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {task.labels && task.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.labels.map((label, labelIdx) => (
                          <span key={labelIdx} className="px-1.5 py-0.5 bg-indigo-900/50 text-indigo-300 rounded text-xs">
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return null;
  };
  
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
            onClick={() => setViewMode('kanban')}
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
            onClick={() => setViewMode('calendar')}
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
            isWorkspacePanelVisible 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={toggleWorkspacePanel}
          title={isWorkspacePanelVisible ? "Hide Workspace" : "Show Workspace"}
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>Workspace</span>
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
              onClick={() => {
                setSearchTerm('');
                setFilters({
                  priority: 'all',
                  completed: 'all',
                  dueDate: 'any',
                  labels: []
                });
                handleSearch('');
                handleFilter({
                  priority: 'all',
                  completed: 'all',
                  dueDate: 'any',
                  labels: []
                });
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {viewMode === 'kanban' ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className={`flex-1 overflow-x-auto p-4 ${isWorkspacePanelVisible ? 'pr-0' : ''}`}>
              <div className="flex h-full">
                {columns.map(column => {
                  const tasks = hasActiveFilters ? getFilteredTasks(column.id) : getTasks(column.id);
                  const isTaskInputExpanded = expandedTaskInputs[column.id];
                  
                  return (
                    <div key={column.id} className="flex flex-col w-80 min-w-80 mr-4 bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
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
                      
                      {/* Add Task Section */}
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
                  <div className="w-80 min-w-80">
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
                  <div className="w-80 min-w-80 p-4 bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
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
          <div className={`flex-1 overflow-x-auto p-4 ${isWorkspacePanelVisible ? 'pr-0' : ''}`}>
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <button 
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                    onClick={handleCalendarPrevious}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  <button 
                    className="px-3 py-1.5 text-sm text-indigo-400 hover:text-indigo-300 bg-indigo-900/20 hover:bg-indigo-900/30 rounded-md transition-colors"
                    onClick={handleCalendarToday}
                  >
                    Today
                  </button>
                  
                  <button 
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                    onClick={handleCalendarNext}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  <h3 className="text-lg font-medium text-white ml-2">
                    {calendarView === 'month' && formatCalendarDate(currentDate, 'long')}
                    {calendarView === 'week' && formatCalendarDate(currentDate, 'week')}
                    {calendarView === 'day' && formatCalendarDate(currentDate, 'day')}
                  </h3>
                </div>
                
                <div className="flex bg-gray-800 rounded-md p-1">
                  <button 
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      calendarView === 'month' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setCalendarView('month')}
                  >
                    Month
                  </button>
                  <button 
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      calendarView === 'week' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setCalendarView('week')}
                  >
                    Week
                  </button>
                  <button 
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      calendarView === 'day' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setCalendarView('day')}
                  >
                    Day
                  </button>
                </div>
              </div>
              
              {renderCalendarView()}
              
              <div className="mt-6">
                <h3 className="text-white font-medium mb-3">Tasks without due dates</h3>
                
                <div className="bg-gray-850 rounded-lg border border-gray-700 overflow-hidden">
                  {getTasksWithoutDueDates().length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      No tasks without due dates
                    </div>
                  ) : (
                    <div className="p-4 space-y-2">
                      {getTasksWithoutDueDates().slice(0, 5).map((task, idx) => (
                        <div 
                          key={idx}
                          className={`p-2 rounded border-l-2 cursor-pointer ${getPriorityClasses(task.priority)} text-white bg-gray-750`}
                          onClick={() => setSelectedTaskId(task.id)}
                        >
                          <div className="text-sm font-medium">{task.content}</div>
                          <div className="text-xs text-gray-400 mt-1">{task.columnName}</div>
                        </div>
                      ))}
                      
                      {getTasksWithoutDueDates().length > 5 && (
                        <div className="text-center py-2 text-indigo-400 text-sm">
                          + {getTasksWithoutDueDates().length - 5} more tasks without due dates
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {isWorkspacePanelVisible && (
          <div className="w-80 min-w-80 h-full">
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
          task={columns.reduce((foundTask, column) => {
            if (foundTask) return foundTask;
            const columnTasks = getTasks(column.id);
            return columnTasks.find(t => t.id === selectedTaskId) || null;
          }, null)}
          onClose={() => setSelectedTaskId(null)}
          onUpdate={onUpdateTask}
          onDelete={onDeleteTask}
        />
      )}
      
      {showQuickAddModal && quickAddDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-gray-850 w-full max-w-md rounded-lg shadow-2xl border border-gray-700 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-medium">
                Add Task for {quickAddDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </h3>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={() => setShowQuickAddModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <textarea
              value={quickAddContent}
              onChange={(e) => setQuickAddContent(e.target.value)}
              placeholder="What needs to be done?"
              rows="3"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none mb-3"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleCreateQuickTask();
                }
              }}
            />
            
            <div className="flex justify-end space-x-2">
              <button
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md focus:outline-none transition-colors"
                onClick={() => setShowQuickAddModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors"
                onClick={handleCreateQuickTask}
                disabled={!quickAddContent.trim()}
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardView;