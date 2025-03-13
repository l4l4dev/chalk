// src/App.js
import React, { useState, useEffect } from 'react';
import { 
  initializeStore, 
  getGroups, 
  getBoards, 
  getColumns, 
  getTasks,
  createGroup,
  createBoard,
  createColumn,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  subscribeToChanges
} from './data/store';

import GroupsView from './components/GroupsView';
import BoardsView from './components/BoardsView';
import BoardView from './components/BoardView';
import DashboardView from './components/DashboardView';
import AchievementsView from './components/AchievementsView';
import NotificationSystem from './components/NotificationSystem';
import Sidebar from './components/Sidebar';

const App = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [groups, setGroups] = useState([]);
  const [currentGroupId, setCurrentGroupId] = useState(null);
  const [currentBoardId, setCurrentBoardId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentView, setCurrentView] = useState('groups'); // 'groups', 'boards', 'board', 'dashboard', 'achievements'
  const [notifications, setNotifications] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeStore();
        console.log('Store initialized');
        
        refreshGroups();
        
        const savedAchievements = localStorage.getItem('chalk-achievements');
        if (savedAchievements) {
          setAchievements(JSON.parse(savedAchievements));
        }
        
        const unsubscribe = subscribeToChanges(() => {
          console.log('Store updated');
          refreshGroups();
          checkForNewAchievements();
        });
        
        setIsLoaded(true);
        
        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing store:', error);
        setIsLoaded(true);
      }
    };
    
    init();
  }, []);
  
  useEffect(() => {
    if (achievements.length > 0) {
      localStorage.setItem('chalk-achievements', JSON.stringify(achievements));
    }
  }, [achievements]);

  const refreshGroups = () => {
    setGroups(getGroups());
  };

  const handleCreateGroup = (name, description = '') => {
    createGroup(name, description);
  };

  const handleCreateBoard = (name, description = '') => {
    if (currentGroupId) {
      createBoard(currentGroupId, name, description);
    }
  };

  const handleCreateColumn = (name) => {
    if (currentBoardId) {
      createColumn(currentBoardId, name);
    }
  };

  const handleUpdateTask = (taskId, updates) => {
    updateTask(taskId, updates);
    
    if (updates.completed) {
      setTimeout(() => checkForNewAchievements(), 500);
    }
  };
  
  const handleDeleteTask = (taskId) => {
    deleteTask(taskId);
  };

  const handleCreateTask = (columnId, content) => {
    createTask(columnId, content);
    
    setTimeout(() => checkForNewAchievements(), 500);
  };

  const handleMoveTask = (taskId, sourceColumnId, destinationColumnId, sourceIndex, destinationIndex) => {
    moveTask(taskId, sourceColumnId, destinationColumnId, sourceIndex, destinationIndex);
  };

  const getCurrentGroup = () => {
    return groups.find(group => group.id === currentGroupId);
  };

  const getCurrentBoards = () => {
    return currentGroupId ? getBoards(currentGroupId) : [];
  };

  const getCurrentBoard = () => {
    const boards = getCurrentBoards();
    return boards.find(board => board.id === currentBoardId);
  };

  const getCurrentColumns = () => {
    return currentBoardId ? getColumns(currentBoardId) : [];
  };

  const handleSelectGroup = (groupId) => {
    setCurrentGroupId(groupId);
    setCurrentBoardId(null);
    setCurrentView('boards');
  };

  const handleSelectBoard = (boardId) => {
    setCurrentBoardId(boardId);
    setCurrentView('board');
  };

  const handleShowDashboard = () => {
    setCurrentView('dashboard');
  };
  
  const handleShowAchievements = () => {
    setCurrentView('achievements');
  };

  const handleBackToGroups = () => {
    setCurrentGroupId(null);
    setCurrentBoardId(null);
    setCurrentView('groups');
  };

  const handleBackToBoards = () => {
    setCurrentBoardId(null);
    setCurrentView('boards');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  const checkForNewAchievements = () => {
    let tasksCreated = 0;
    let tasksCompleted = 0;
    let boardsCreated = 0;
    
    groups.forEach(group => {
      const boards = getBoards(group.id);
      boardsCreated += boards.length;
      
      boards.forEach(board => {
        const columns = getColumns(board.id);
        
        columns.forEach(column => {
          const tasks = getTasks(column.id);
          tasksCreated += tasks.length;
          
          tasks.forEach(task => {
            if (task.completed) {
              tasksCompleted++;
            }
          });
        });
      });
    });
    
    const possibleAchievements = [
      {
        id: 'first-task',
        title: 'First Steps',
        icon: '🌱',
        message: 'You created your first task',
        condition: tasksCreated >= 1
      },
      {
        id: 'first-completion',
        title: 'Mission Accomplished',
        icon: '✅',
        message: 'You completed your first task',
        condition: tasksCompleted >= 1
      },
      {
        id: 'task-master',
        title: 'Task Master',
        icon: '📝',
        message: 'You created 10 tasks',
        condition: tasksCreated >= 10
      },
      {
        id: 'getting-things-done',
        title: 'Getting Things Done',
        icon: '🚀',
        message: 'You completed 25 tasks',
        condition: tasksCompleted >= 25
      },
      {
        id: 'organizer',
        title: 'Organizer',
        icon: '📊',
        message: 'You created 3 boards',
        condition: boardsCreated >= 3
      }
    ];
    
    const achievementIds = achievements.map(a => a.id);
    const newAchievements = possibleAchievements.filter(
      achievement => achievement.condition && !achievementIds.includes(achievement.id)
    );
    
    // new achievements
    if (newAchievements.length > 0) {
      setAchievements([...achievements, ...newAchievements]);
      
      newAchievements.forEach(achievement => {
        addNotification({
          id: `achievement-${achievement.id}`,
          type: 'achievement',
          title: achievement.title,
          message: achievement.message,
          icon: achievement.icon,
          duration: 7000
        });
      });
    }
  };
  
  const addNotification = (notification) => {
    const id = notification.id || `notification-${Date.now()}`;
    setNotifications(prevNotifications => [
      ...prevNotifications,
      { ...notification, id }
    ]);
  };
  
  const removeNotification = (id) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen bg-gray-900 text-white">
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="w-10 h-10 border-3 border-t-indigo-500 border-gray-700 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // render main app here
  return (
    <div className="flex h-screen overflow-hidden bg-gray-900 text-white">
      <Sidebar 
        groups={groups}
        currentGroupId={currentGroupId}
        onSelectGroup={handleSelectGroup}
        onCreateGroup={handleCreateGroup}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onShowDashboard={handleShowDashboard}
        onShowAchievements={handleShowAchievements}
      />
      
      <div className="flex-1 overflow-hidden flex flex-col">
        {currentView === 'groups' && (
          <GroupsView 
            groups={groups} 
            onSelectGroup={handleSelectGroup} 
            onCreateGroup={handleCreateGroup}
          />
        )}
        
        {currentView === 'boards' && (
          <BoardsView 
            group={getCurrentGroup()} 
            boards={getCurrentBoards()} 
            onSelectBoard={handleSelectBoard} 
            onCreateBoard={handleCreateBoard} 
            onBack={handleBackToGroups}
          />
        )}
        
        {currentView === 'board' && (
          <BoardView 
            board={getCurrentBoard()} 
            columns={getCurrentColumns()} 
            getTasks={getTasks} 
            onCreateColumn={handleCreateColumn} 
            onCreateTask={handleCreateTask} 
            onMoveTask={handleMoveTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onBack={handleBackToBoards}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            groups={groups}
            getBoards={getBoards}
            getColumns={getColumns}
            getTasks={getTasks}
            currentGroupId={currentGroupId}
            onSelectBoard={handleSelectBoard}
            onBack={handleBackToGroups}
          />
        )}
        
        {currentView === 'achievements' && (
          <AchievementsView
            groups={groups}
            getBoards={getBoards}
            getColumns={getColumns}
            getTasks={getTasks}
            onBack={handleBackToGroups}
            earnedAchievements={achievements}
          />
        )}
        
        <NotificationSystem 
          notifications={notifications}
          onDismiss={removeNotification}
        />
      </div>
    </div>
  );
};

export default App;