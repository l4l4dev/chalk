// src/data/store.js
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { v4 as uuidv4 } from 'uuid';

const ydoc = new Y.Doc();

const persistence = new IndexeddbPersistence('chalk-db', ydoc);

const groupsMap = ydoc.getMap('groups');
const boardsMap = ydoc.getMap('boards');
const columnsMap = ydoc.getMap('columns');
const tasksMap = ydoc.getMap('tasks');

/**
 * Initialize the store with default data if empty
 */
export const initializeStore = () => {
  return new Promise((resolve) => {
    persistence.on('synced', () => {
      console.log('Data synced with IndexedDB');
      
      if (groupsMap.size === 0) {
        console.log('Creating default data');
        
        const defaultGroupId = uuidv4();
        const defaultGroup = {
          id: defaultGroupId,
          name: 'Personal',
          description: 'My personal tasks',
          createdAt: new Date().toISOString(),
          boardIds: []
        };
        
        const defaultBoardId = uuidv4();
        const defaultBoard = {
          id: defaultBoardId,
          name: 'My Tasks',
          description: 'Daily tasks tracker',
          groupId: defaultGroupId,
          createdAt: new Date().toISOString(),
          columnIds: []
        };
        
        // Add default columns
        const todoColumnId = uuidv4();
        const todoColumn = {
          id: todoColumnId,
          name: 'To Do',
          boardId: defaultBoardId,
          taskIds: [],
          order: 0
        };
        
        const inProgressColumnId = uuidv4();
        const inProgressColumn = {
          id: inProgressColumnId,
          name: 'In Progress',
          boardId: defaultBoardId,
          taskIds: [],
          order: 1
        };
        
        const doneColumnId = uuidv4();
        const doneColumn = {
          id: doneColumnId,
          name: 'Done',
          boardId: defaultBoardId,
          taskIds: [],
          order: 2
        };
        
        // Update the references
        defaultGroup.boardIds = [defaultBoardId];
        defaultBoard.columnIds = [todoColumnId, inProgressColumnId, doneColumnId];
        
        // Save all entities
        groupsMap.set(defaultGroupId, defaultGroup);
        boardsMap.set(defaultBoardId, defaultBoard);
        columnsMap.set(todoColumnId, todoColumn);
        columnsMap.set(inProgressColumnId, inProgressColumn);
        columnsMap.set(doneColumnId, doneColumn);
        
        const sampleTaskId = uuidv4();
        const sampleTask = {
          id: sampleTaskId,
          content: 'Welcome to Chalk! Drag this task to another column.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          columnId: todoColumnId
        };
        
        tasksMap.set(sampleTaskId, sampleTask);
        
        todoColumn.taskIds = [sampleTaskId];
        columnsMap.set(todoColumnId, todoColumn);
      } else {
        console.log('Using existing data');
      }
      
      resolve();
    });
  });
};

/**
 * Group CRUD operations
 */
export const createGroup = (name, description = '') => {
  const id = uuidv4();
  const group = {
    id,
    name,
    description,
    createdAt: new Date().toISOString(),
    boardIds: []
  };
  
  groupsMap.set(id, group);
  return id;
};

export const getGroups = () => {
  return Array.from(groupsMap.values()).sort((a, b) => 
    new Date(a.createdAt) - new Date(b.createdAt)
  );
};

export const getGroup = (id) => {
  return groupsMap.get(id);
};

export const updateGroup = (id, updates) => {
  const group = groupsMap.get(id);
  if (!group) return false;
  
  const updatedGroup = { ...group, ...updates };
  groupsMap.set(id, updatedGroup);
  return true;
};

export const deleteGroup = (id) => {
  const group = groupsMap.get(id);
  if (!group) return false;
  
  if (group.boardIds && Array.isArray(group.boardIds)) {
    group.boardIds.forEach(boardId => {
      deleteBoard(boardId);
    });
  }
  
  groupsMap.delete(id);
  return true;
};

/**
 * Board CRUD operations
 */
export const createBoard = (groupId, name, description = '') => {
  const group = groupsMap.get(groupId);
  if (!group) return null;
  
  const id = uuidv4();
  const board = {
    id,
    name,
    description,
    groupId,
    createdAt: new Date().toISOString(),
    columnIds: []
  };
  
  const todoColumnId = uuidv4();
  const todoColumn = {
    id: todoColumnId,
    name: 'To Do',
    boardId: id,
    taskIds: [],
    order: 0
  };
  
  const inProgressColumnId = uuidv4();
  const inProgressColumn = {
    id: inProgressColumnId,
    name: 'In Progress',
    boardId: id,
    taskIds: [],
    order: 1
  };
  
  const doneColumnId = uuidv4();
  const doneColumn = {
    id: doneColumnId,
    name: 'Done',
    boardId: id,
    taskIds: [],
    order: 2
  };
  
  board.columnIds = [todoColumnId, inProgressColumnId, doneColumnId];
  
  boardsMap.set(id, board);
  columnsMap.set(todoColumnId, todoColumn);
  columnsMap.set(inProgressColumnId, inProgressColumn);
  columnsMap.set(doneColumnId, doneColumn);
  
  const updatedGroup = { ...group };
  if (!updatedGroup.boardIds) {
    updatedGroup.boardIds = [];
  }
  updatedGroup.boardIds.push(id);
  groupsMap.set(groupId, updatedGroup);
  
  return id;
};

export const getBoards = (groupId) => {
  return Array.from(boardsMap.values())
    .filter(board => board.groupId === groupId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

export const getBoard = (id) => {
  return boardsMap.get(id);
};

export const updateBoard = (id, updates) => {
  const board = boardsMap.get(id);
  if (!board) return false;
  
  const updatedBoard = { ...board, ...updates };
  boardsMap.set(id, updatedBoard);
  return true;
};

export const deleteBoard = (id) => {
  const board = boardsMap.get(id);
  if (!board) return false;
  
  if (board.columnIds && Array.isArray(board.columnIds)) {
    board.columnIds.forEach(columnId => {
      deleteColumn(columnId);
    });
  }
  
  const group = groupsMap.get(board.groupId);
  if (group && group.boardIds && Array.isArray(group.boardIds)) {
    const updatedGroup = { ...group };
    updatedGroup.boardIds = updatedGroup.boardIds.filter(boardId => boardId !== id);
    groupsMap.set(board.groupId, updatedGroup);
  }
  
  boardsMap.delete(id);
  return true;
};

/**
 * Column CRUD operations
 */
export const createColumn = (boardId, name) => {
  const board = boardsMap.get(boardId);
  if (!board) return null;
  
  const id = uuidv4();
  const column = {
    id,
    name,
    boardId,
    taskIds: [],
    order: board.columnIds ? board.columnIds.length : 0
  };
  
  columnsMap.set(id, column);
  
  const updatedBoard = { ...board };
  if (!updatedBoard.columnIds) {
    updatedBoard.columnIds = [];
  }
  updatedBoard.columnIds.push(id);
  boardsMap.set(boardId, updatedBoard);
  
  return id;
};

export const getColumns = (boardId) => {
  return Array.from(columnsMap.values())
    .filter(column => column.boardId === boardId)
    .sort((a, b) => a.order - b.order);
};

export const getColumn = (id) => {
  return columnsMap.get(id);
};

export const updateColumn = (id, updates) => {
  const column = columnsMap.get(id);
  if (!column) return false;
  
  const updatedColumn = { ...column, ...updates };
  columnsMap.set(id, updatedColumn);
  return true;
};

export const deleteColumn = (id) => {
  const column = columnsMap.get(id);
  if (!column) return false;
  
  if (column.taskIds && Array.isArray(column.taskIds)) {
    column.taskIds.forEach(taskId => {
      tasksMap.delete(taskId);
    });
  }
  
  const board = boardsMap.get(column.boardId);
  if (board && board.columnIds && Array.isArray(board.columnIds)) {
    const updatedBoard = { ...board };
    updatedBoard.columnIds = updatedBoard.columnIds.filter(columnId => columnId !== id);
    boardsMap.set(column.boardId, updatedBoard);
  }
  
  columnsMap.delete(id);
  return true;
};

/**
 * Task CRUD operations
 */
export const createTask = (columnId, content, details = {}) => {
  const column = columnsMap.get(columnId);
  if (!column) return null;
  
  const id = uuidv4();
  const task = {
    id,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    columnId,
    dueDate: details.dueDate || null,
    priority: details.priority || 'medium', // low, medium, high
    labels: details.labels || [],
    assignedTo: details.assignedTo || null,
    description: details.description || '',
    attachments: details.attachments || [],
    completed: false,
    estimatedTime: details.estimatedTime || null,
    actualTime: details.actualTime || null,
    comments: []
  };
  
  tasksMap.set(id, task);
  
  const updatedColumn = { ...column };
  if (!updatedColumn.taskIds) {
    updatedColumn.taskIds = [];
  }
  updatedColumn.taskIds.push(id);
  columnsMap.set(columnId, updatedColumn);
  
  return id;
};

export const getTasks = (columnId) => {
  const column = columnsMap.get(columnId);
  if (!column || !column.taskIds || !Array.isArray(column.taskIds)) return [];
  
  return column.taskIds.map(taskId => tasksMap.get(taskId)).filter(Boolean);
};

export const getTask = (id) => {
  return tasksMap.get(id);
};

export const updateTask = (id, updates) => {
  const task = tasksMap.get(id);
  if (!task) return false;
  
  const updatedTask = { 
    ...task, 
    ...updates,
    updatedAt: new Date().toISOString()
  };
  tasksMap.set(id, updatedTask);
  return true;
};

export const deleteTask = (id) => {
  const task = tasksMap.get(id);
  if (!task) return false;
  
  const column = columnsMap.get(task.columnId);
  if (column && column.taskIds && Array.isArray(column.taskIds)) {
    const updatedColumn = { ...column };
    updatedColumn.taskIds = updatedColumn.taskIds.filter(taskId => taskId !== id);
    columnsMap.set(task.columnId, updatedColumn);
  }
  
  tasksMap.delete(id);
  return true;
};

/**
 * Task movement operations
 */
export const moveTask = (taskId, sourceColumnId, destinationColumnId, sourceIndex, destinationIndex) => {
  const task = tasksMap.get(taskId);
  const sourceColumn = columnsMap.get(sourceColumnId);
  const destinationColumn = columnsMap.get(destinationColumnId);
  
  if (!task || !sourceColumn || !destinationColumn) return false;
  
  if (!sourceColumn.taskIds) sourceColumn.taskIds = [];
  if (!destinationColumn.taskIds) destinationColumn.taskIds = [];
  
  const updatedSourceColumn = { ...sourceColumn };
  const updatedDestinationColumn = { ...destinationColumn };
  
  updatedSourceColumn.taskIds = updatedSourceColumn.taskIds.filter(id => id !== taskId);
  
  updatedDestinationColumn.taskIds = [...updatedDestinationColumn.taskIds];
  updatedDestinationColumn.taskIds.splice(destinationIndex, 0, taskId);
  
  const updatedTask = { ...task, columnId: destinationColumnId };
  
  columnsMap.set(sourceColumnId, updatedSourceColumn);
  columnsMap.set(destinationColumnId, updatedDestinationColumn);
  tasksMap.set(taskId, updatedTask);
  
  return true;
};

/**
 * Subscribe to Y.js changes
 */
export const subscribeToChanges = (callback) => {
  const observer = () => {
    callback();
  };

  groupsMap.observe(observer);
  boardsMap.observe(observer);
  columnsMap.observe(observer);
  tasksMap.observe(observer);
  
  return () => {
    groupsMap.unobserve(observer);
    boardsMap.unobserve(observer);
    columnsMap.unobserve(observer);
    tasksMap.unobserve(observer);
  };
};

export { ydoc, persistence };