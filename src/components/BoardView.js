import React, { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TaskDetailView from './TaskDetailView';

const BoardView = ({ 
  board, 
  columns, 
  getTasks, 
  onCreateColumn, 
  onCreateTask, 
  onMoveTask,
  onUpdateTask,
  onDeleteTask,
  onBack 
}) => {
  const [newColumnName, setNewColumnName] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newTaskContents, setNewTaskContents] = useState({});
  const [expandedTaskInputs, setExpandedTaskInputs] = useState({});
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const newColumnInputRef = useRef(null);
  
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
  
  const handleCreateTask = (columnId) => {
    const content = newTaskContents[columnId];
    if (content && content.trim()) {
      onCreateTask(columnId, content.trim());
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
    
    // Dropped outside the list
    if (!destination) return;
    
    // Dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    // drag drop tasks
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
      case 'high': return 'border-red-500';
      case 'medium': return 'border-amber-500';
      case 'low': return 'border-emerald-500';
      default: return 'border-transparent';
    }
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
      </div>
      
      {board.description && (
        <div className="px-6 py-2 text-gray-400 text-sm">
          <p>{board.description}</p>
        </div>
      )}
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto p-4">
          <div className="flex h-full">
            {columns.map(column => {
              const tasks = getTasks(column.id);
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
                      {/* column menu could go here */}
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
                            <p className="text-gray-500 text-sm">No tasks yet</p>
                          </div>
                        )}
                        
                        {tasks.map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                          >
                            {(provided, snapshot) => {
                              const priorityClasses = getPriorityClasses(task.priority);
                              
                              return (
                                <div
                                  className={`mb-2 bg-gray-900 rounded-md border-l-4 ${priorityClasses} shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                                    snapshot.isDragging ? 'shadow-lg opacity-80' : ''
                                  } ${
                                    task.completed ? 'opacity-60' : ''
                                  } transition-all duration-200 cursor-pointer`}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  onClick={(e) => {
                                    if (!e.defaultPrevented) {
                                      setSelectedTaskId(task.id);
                                    }
                                  }}
                                >
                                  <div className="flex p-3">
                                    <div className="flex-1">
                                      <div className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                                        {task.content}
                                      </div>
                                      
                                      {/* Task Labels */}
                                      {task.labels && task.labels.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {task.labels.slice(0, 3).map((label, index) => (
                                            <span key={index} className="text-xs px-2 py-0.5 rounded-full bg-indigo-900 bg-opacity-40 text-indigo-300">
                                              {label}
                                            </span>
                                          ))}
                                          {task.labels.length > 3 && 
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400">
                                              +{task.labels.length - 3}
                                            </span>
                                          }
                                        </div>
                                      )}
                                      {/* meta data */}
                                      <div className="flex items-center text-xs text-gray-500 mt-2 gap-2">
                                        {task.dueDate && (
                                          <div className={`flex items-center gap-1 ${isOverdue(task.dueDate) ? 'text-red-400' : ''}`}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                              <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            <span>{formatDate(task.dueDate)}</span>
                                          </div>
                                        )}
                                        
                                        {task.assignedTo && (
                                          <div className="flex items-center">
                                            <span className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white font-semibold">
                                              {task.assignedTo.charAt(0).toUpperCase()}
                                            </span>
                                          </div>
                                        )}
                                        
                                        {task.completed && (
                                          <div className="ml-auto flex items-center text-emerald-500">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                              <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            <span className="ml-1">Done</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* drag handle.. i think can change this though */}
                                    <div 
                                      className="flex items-center pl-2 text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing"
                                      {...provided.dragHandleProps}
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 9H16M8 15H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              );
                            }}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                  
                  {/* add task section */}
                  <div className="p-3 border-t border-gray-700">
                    {!isTaskInputExpanded ? (
                      <button 
                        className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white py-2 px-3 bg-gray-700 bg-opacity-50 hover:bg-opacity-70 rounded-md transition-colors"
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
                          className="w-full mb-2 bg-gray-800 border border-gray-700 rounded p-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                            onClick={() => handleCreateTask(column.id)}
                            disabled={!newTaskContents[column.id] || !newTaskContents[column.id].trim()}
                          >
                            Add
                          </button>
                          <button
                            className="px-3 py-1 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900"
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
            
            {/* add column section */}
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
                  className="w-full mb-3 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <div className="flex justify-end gap-2">
                  <button 
                    className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    onClick={handleCreateColumn}
                    disabled={!newColumnName.trim()}
                  >
                    Add
                  </button>
                  <button 
                    className="px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900"
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
    </div>
  );
};

export default BoardView;