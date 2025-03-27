// src/utils/backlogManager.js
import { 
    getGroups, 
    getBoards, 
    getColumns, 
    getTasks,
    moveTask
  } from '../data/store';

  export const processStaleTasksToBacklog = (daysThreshold = 7) => {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - daysThreshold);
    
    const stats = {
      tasksProcessed: 0,
      staleTasksFound: 0,
      tasksMovedToBacklog: 0,
      errors: []
    };
  
    try {
      const groups = getGroups();
      
      groups.forEach(group => {
        const boards = getBoards(group.id);
        
        boards.forEach(board => {
          const columns = getColumns(board.id);
          
          let backlogColumn = columns.find(col => 
            col.name.toLowerCase().includes('backlog')
          );
          
          const targetColumnId = backlogColumn ? backlogColumn.id : columns[0].id;
          
          const nonBacklogColumns = columns.filter(col => 
            col.id !== targetColumnId
          );
          
          nonBacklogColumns.forEach(column => {
            const tasks = getTasks(column.id);
            
            tasks.forEach(task => {
              stats.tasksProcessed++;
              
              if (task.completed) return;
              
              const lastUpdate = new Date(task.updatedAt || task.createdAt);
              const isStale = lastUpdate < staleDate;
              
              if (isStale) {
                stats.staleTasksFound++;
                
                try {
                  const sourceTasks = getTasks(column.id);
                  const sourceIndex = sourceTasks.findIndex(t => t.id === task.id);
                  
                  const targetTasks = getTasks(targetColumnId);
                  const targetIndex = targetTasks.length; 
                  
                  moveTask(
                    task.id,
                    column.id,
                    targetColumnId,
                    sourceIndex,
                    targetIndex
                  );
                  
                  stats.tasksMovedToBacklog++;
                } catch (err) {
                  stats.errors.push({
                    taskId: task.id,
                    error: err.message
                  });
                }
              }
            });
          });
        });
      });
      
      return stats;
    } catch (err) {
      console.error('Error in processStaleTasksToBacklog:', err);
      return {
        ...stats,
        error: err.message
      };
    }
  };
  
  /**
   * Setup a scheduled check for stale tasks
   * @param {number} checkInterval How often to check (in milliseconds)
   * @param {number} daysThreshold Number of days before a task is considered stale
   * @param {function} onComplete Callback when process completes
   * @returns {function} Function to cancel the scheduler
   */
  export const setupStaleTaskScheduler = (
    checkInterval = 24 * 60 * 60 * 1000, // Default: once a day
    daysThreshold = 7, // Default: 7 days
    onComplete = null
  ) => {
    const runCheck = () => {
      const stats = processStaleTasksToBacklog(daysThreshold);
      
      if (onComplete && typeof onComplete === 'function') {
        onComplete(stats);
      }
      
      return stats;
    };
    
    runCheck();
    
    const intervalId = setInterval(runCheck, checkInterval);
    
    return () => clearInterval(intervalId);
  };
  
  /**
   * Checks if a task is stale (not updated for a threshold period)
   * @param {Object} task The task to check
   * @param {number} daysThreshold Number of days threshold
   * @returns {boolean} Whether the task is considered stale
   */
  export const isTaskStale = (task, daysThreshold = 7) => {
    if (!task || task.completed) return false;
    
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - daysThreshold);
    
    const lastUpdate = new Date(task.updatedAt || task.createdAt);
    return lastUpdate < staleDate;
  };