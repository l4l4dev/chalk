// src/data/export-import.js
import { ydoc, persistence } from './store';

export const exportData = async () => {
  await new Promise((resolve) => {
    if (persistence.synced) {
      resolve();
    } else {
      persistence.once('synced', () => resolve());
    }
  });
  
  const data = {
    groups: Array.from(ydoc.getMap('groups').entries()),
    boards: Array.from(ydoc.getMap('boards').entries()),
    columns: Array.from(ydoc.getMap('columns').entries()),
    tasks: Array.from(ydoc.getMap('tasks').entries()),
    workspaceItems: Array.from(ydoc.getMap('workspaceItems').entries()),
    version: '1.0.0-beta',
    exportDate: new Date().toISOString()
  };
  
  return JSON.stringify(data, null, 2);
};

export const importData = async (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    
    if (!data.groups || !data.boards || !data.columns || !data.tasks) {
      throw new Error('Invalid data format');
    }
    
    ydoc.getMap('groups').clear();
    ydoc.getMap('boards').clear();
    ydoc.getMap('columns').clear();
    ydoc.getMap('tasks').clear();
    ydoc.getMap('workspaceItems').clear();
    
    data.groups.forEach(([key, value]) => ydoc.getMap('groups').set(key, value));
    data.boards.forEach(([key, value]) => ydoc.getMap('boards').set(key, value));
    data.columns.forEach(([key, value]) => ydoc.getMap('columns').set(key, value));
    data.tasks.forEach(([key, value]) => ydoc.getMap('tasks').set(key, value));
    
    if (data.workspaceItems) {
      data.workspaceItems.forEach(([key, value]) => ydoc.getMap('workspaceItems').set(key, value));
    }
    
    return { success: true, message: 'Data imported successfully' };
  } catch (error) {
    console.error('Import error:', error);
    return { success: false, message: error.message };
  }
};

export const downloadExportFile = async () => {
  const data = await exportData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `chalk-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const readImportFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};