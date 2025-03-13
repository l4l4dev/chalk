import React, { useState, useEffect } from 'react';

const TaskDetailView = ({ task, onClose, onUpdate, onDelete }) => {
  const [editedTask, setEditedTask] = useState({
    content: task.content,
    description: task.description || '',
    dueDate: task.dueDate || '',
    priority: task.priority || 'medium',
    labels: task.labels || [],
    assignedTo: task.assignedTo || '',
    estimatedTime: task.estimatedTime || '',
    completed: task.completed || false
  });
  
  const [newLabel, setNewLabel] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  
  // Add escape key event listener
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedTask({
      ...editedTask,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleAddLabel = () => {
    if (newLabel.trim() && !editedTask.labels.includes(newLabel.trim())) {
      setEditedTask({
        ...editedTask,
        labels: [...editedTask.labels, newLabel.trim()]
      });
      setNewLabel('');
    }
  };
  
  const handleRemoveLabel = (labelToRemove) => {
    setEditedTask({
      ...editedTask,
      labels: editedTask.labels.filter(label => label !== labelToRemove)
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(task.id, editedTask);
    onClose();
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ff6b6b';
      case 'medium': return '#feca57';
      case 'low': return '#1dd1a1';
      default: return '#1dd1a1';
    }
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'details':
        return (
          <>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={editedTask.description}
                onChange={handleChange}
                rows="4"
                placeholder="Add a more detailed description..."
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dueDate">Due Date</label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={editedTask.dueDate}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="estimatedTime">Est. Hours</label>
                <input
                  type="number"
                  id="estimatedTime"
                  name="estimatedTime"
                  value={editedTask.estimatedTime}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  placeholder="0"
                />
              </div>
            </div>
          </>
        );
      
      case 'labels':
        return (
          <>
            <div className="form-group">
              <div className="labels-container">
                {editedTask.labels.length > 0 ? (
                  editedTask.labels.map((label, index) => (
                    <div key={index} className="label-chip">
                      <span>{label}</span>
                      <button 
                        type="button" 
                        className="remove-label"
                        onClick={() => handleRemoveLabel(label)}
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No labels added yet</p>
                )}
              </div>
              
              <div className="add-label-input">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Enter a new label"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLabel();
                    }
                  }}
                />
                <button 
                  type="button" 
                  className="primary icon-button"
                  onClick={handleAddLabel}
                >
                  +
                </button>
              </div>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="task-detail-overlay">
      <div className="task-detail-dialog">
        <div className="dialog-backdrop" onClick={onClose}></div>
        <div className="task-detail-modal">
          <form onSubmit={handleSubmit}>
            <div className="task-detail-header">
              <div className="completion-priority">
                <label className="completion-checkbox" title="Mark as complete">
                  <input
                    type="checkbox"
                    name="completed"
                    checked={editedTask.completed}
                    onChange={handleChange}
                  />
                  <span className="checkmark"></span>
                </label>
                
                <div className="priority-selector">
                  <select
                    id="priority"
                    name="priority"
                    value={editedTask.priority}
                    onChange={handleChange}
                    style={{
                      borderColor: getPriorityColor(editedTask.priority),
                      color: getPriorityColor(editedTask.priority)
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <button className="close-button" type="button" onClick={onClose}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="task-content-field">
              <input
                type="text"
                id="content"
                name="content"
                value={editedTask.content}
                onChange={handleChange}
                placeholder="Task title"
                required
                className="task-title-input"
              />
            </div>
            
            <div className="task-meta-info">
              <div className="meta-item">
                <span className="meta-label">Created:</span>
                <span className="meta-value">{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
              {task.updatedAt && (
                <div className="meta-item">
                  <span className="meta-label">Updated:</span>
                  <span className="meta-value">{new Date(task.updatedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            
            <div className="tab-navigation">
              <button 
                type="button"
                className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Details
              </button>
              <button 
                type="button"
                className={`tab-button ${activeTab === 'labels' ? 'active' : ''}`}
                onClick={() => setActiveTab('labels')}
              >
                Labels ({editedTask.labels.length})
              </button>
            </div>
            
            <div className="tab-content">
              {renderTabContent()}
            </div>
            
            <div className="task-assigned">
              <label htmlFor="assignedTo">Assigned To</label>
              <input
                type="text"
                id="assignedTo"
                name="assignedTo"
                value={editedTask.assignedTo}
                onChange={handleChange}
                placeholder="Assign to someone..."
              />
            </div>
            
            <div className="form-actions">
              <div className="primary-actions">
                <button type="submit" className="primary">Save</button>
                <button type="button" className="secondary" onClick={onClose}>Cancel</button>
              </div>
              
              <button 
                type="button" 
                className="danger"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this task?')) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
              >
                Delete
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailView;