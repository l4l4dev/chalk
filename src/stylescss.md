```
/* Modern variables for consistent styling
:root {
  /* Core colors */
  --primary: #764abc;
  --primary-dark: #5f35a5;
  --secondary: #6c757d;
  --success: #1dd1a1;
  --danger: #ff6b6b;
  --warning: #feca57;
  --info: #54a0ff;
  
  /* Dark theme colors */
  --bg-dark: #121212;
  --surface-dark: #1e1e1e;
  --card-dark: #252525;
  --card-hover-dark: #2d2d2d;
  --border-dark: #333333;
  --text-dark: #e1e1e1;
  --text-secondary-dark: #a0a0a0;
  --shadow-dark: rgba(0, 0, 0, 0.4);

  /* Light theme colors (for future use) */
  --bg-light: #f5f5f7;
  --surface-light: #ffffff;
  --card-light: #ffffff;
  --card-hover-light: #f0f0f0;
  --border-light: #e0e0e0;
  --text-light: #333333;
  --text-secondary-light: #666666;
  --shadow-light: rgba(0, 0, 0, 0.1);
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.25s ease;
  --transition-slow: 0.4s ease;
}

/* Apply dark mode variables */
.dark-mode {
  --bg: var(--bg-dark);
  --surface: var(--surface-dark);
  --card-bg: var(--card-dark);
  --card-hover: var(--card-hover-dark);
  --border: var(--border-dark);
  --text: var(--text-dark);
  --text-secondary: var(--text-secondary-dark);
  --shadow: var(--shadow-dark);
  
  --input-bg: #2c2c2c;
  --input-border: #444444;
  --input-text: var(--text);
  
  --scrollbar-track: #1a1a1a;
  --scrollbar-thumb: #444444;
  --scrollbar-thumb-hover: #555555;
  
  color-scheme: dark;
}

/* Apply light mode variables */
.light-mode {
  --bg: var(--bg-light);
  --surface: var(--surface-light);
  --card-bg: var(--card-light);
  --card-hover: var(--card-hover-light);
  --border: var(--border-light);
  --text: var(--text-light);
  --text-secondary: var(--text-secondary-light);
  --shadow: var(--shadow-light);
  
  --input-bg: #ffffff;
  --input-border: #cccccc;
  --input-text: var(--text);
  
  --scrollbar-track: #f1f1f1;
  --scrollbar-thumb: #c1c1c1;
  --scrollbar-thumb-hover: #a1a1a1;
  
  color-scheme: light;
}

/* Reset and base styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: var(--bg);
  color: var(--text);
  line-height: 1.5;
  font-size: 16px;
  overflow: hidden;
  height: 100vh;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: var(--spacing-md);
}

a {
  color: var(--primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--primary-dark);
}

button {
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  transition: all var(--transition-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button svg {
  width: 18px;
  height: 18px;
}

button.primary {
  background-color: var(--primary);
  color: white;
}

button.primary:hover:not(:disabled) {
  background-color: var(--primary-dark);
}

button.secondary {
  background-color: transparent;
  color: var(--text);
  border: 1px solid var(--border);
}

button.secondary:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.05);
}

button.danger {
  background-color: transparent;
  color: var(--danger);
  border: 1px solid var(--danger);
}

button.danger:hover:not(:disabled) {
  background-color: var(--danger);
  color: white;
}

button.icon-button {
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 50%;
  background-color: transparent;
}

button.icon-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

input, textarea, select {
  font-family: inherit;
  font-size: 14px;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: var(--radius-md);
  color: var(--input-text);
  transition: border-color var(--transition-fast);
  width: 100%;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(118, 74, 188, 0.2);
}

textarea {
  resize: vertical;
  min-height: 80px;
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23a0a0a0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
  padding-right: 32px;
}

::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
}

::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}

/* App Layout */
.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Loading screen */
.loading {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary);
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Sidebar */
.sidebar {
  width: 260px;
  background-color: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  transition: width var(--transition-normal);
}

.sidebar-header {
  padding: var(--spacing-md) var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
}

.app-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, var(--primary) 30%, #9b6dff 90%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.theme-toggle {
  cursor: pointer;
  font-size: 18px;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
}

.theme-toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar-section {
  padding: var(--spacing-md) 0;
  flex: 1;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-md) var(--spacing-sm);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 1px;
}

.group-list {
  display: flex;
  flex-direction: column;
}

.group-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  margin: 2px var(--spacing-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  color: var(--text);
}

.group-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.group-item.active {
  background-color: rgba(118, 74, 188, 0.15);
  color: var(--primary);
}

.group-icon {
  margin-right: var(--spacing-sm);
  opacity: 0.8;
}

.group-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.group-count {
  font-size: 12px;
  color: var(--text-secondary);
  background-color: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.new-group-input {
  margin: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
}

.input-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.small-button {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.small-button.confirm {
  background-color: var(--success);
  color: white;
}

.small-button.cancel {
  background-color: var(--danger);
  color: white;
}

.sidebar-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border);
}

.sidebar-action {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.sidebar-action:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.action-icon {
  margin-right: var(--spacing-sm);
}

/* View header */
.view-header {
  display: flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border);
}

.back-button {
  margin-right: var(--spacing-md);
}

/* Groups/Boards Grid */
.groups-view, .boards-view {
  padding: var(--spacing-lg);
  overflow-y: auto;
  height: 100%;
}

.groups-grid, .boards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.group-card, .board-card {
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  border: 1px solid var(--border);
}

.group-card:hover, .board-card:hover,
.add-group-card:hover, .add-board-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px var(--shadow);
  border-color: rgba(118, 74, 188, 0.3);
}

.group-description, .board-description {
  color: var(--text-secondary);
  margin-top: var(--spacing-sm);
  font-size: 14px;
  flex: 1;
}

.group-meta, .board-meta {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-md);
  font-size: 13px;
  color: var(--text-secondary);
}

.add-group-card, .add-board-card {
  background-color: rgba(255, 255, 255, 0.03);
  border: 1px dashed var(--border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-secondary);
  font-weight: 500;
}

.create-group-form, .create-board-form {
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--border);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

/* Board View */
.board-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.board-description {
  padding: 0 var(--spacing-lg) var(--spacing-md);
  color: var(--text-secondary);
  font-size: 14px;
}

.columns-container {
  display: flex;
  overflow-x: auto;
  padding: var(--spacing-md);
  height: 100%;
  align-items: flex-start;
}

.board-column {
  display: flex;
  flex-direction: column;
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  width: 300px;
  min-width: 300px;
  margin-right: var(--spacing-md);
  height: 100%;
  max-height: 100%;
  overflow: hidden;
  border: 1px solid var(--border);
}

.column-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.column-header-content {
  display: flex;
  align-items: center;
}

.column-name {
  font-weight: 600;
  margin-right: var(--spacing-sm);
}

.column-count {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.column-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
  padding-bottom: 0;
}

.column-content.dragging-over {
  background-color: rgba(118, 74, 188, 0.05);
}

.empty-column {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: var(--text-secondary);
  font-size: 14px;
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
}

.task-card {
  background-color: var(--surface);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  cursor: grab;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
  display: flex;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.task-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.task-card.dragging {
  box-shadow: 0 8px 16px var(--shadow);
  opacity: 0.8;
}

.task-card.completed {
  opacity: 0.7;
}

.task-card.completed .task-content {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.drag-handle {
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  opacity: 0.3;
  padding: var(--spacing-md) 0;
  cursor: grab;
  transition: opacity var(--transition-fast);
}

.task-card:hover .drag-handle {
  opacity: 0.7;
}

.task-card-content {
  flex: 1;
  padding: var(--spacing-md);
  padding-left: 0;
}

.task-content {
  margin-bottom: var(--spacing-sm);
  word-break: break-word;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  margin-top: var(--spacing-sm);
}

.task-due-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background-color: rgba(255, 255, 255, 0.05);
}

.task-due-date.overdue {
  color: var(--danger);
  background-color: rgba(255, 107, 107, 0.1);
}

.task-due-date svg {
  opacity: 0.7;
}

.task-assignee {
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
}

.task-completed {
  color: var(--success);
}

.task-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: var(--spacing-xs);
}

.task-label {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: rgba(118, 74, 188, 0.15);
  color: var(--primary);
}

.more-labels {
  font-size: 11px;
  color: var(--text-secondary);
}

.add-task-section {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border);
}

.add-task-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  color: var(--text-secondary);
  background-color: transparent;
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.add-task-button:hover {
  background-color: rgba(255, 255, 255, 0.03);
  color: var(--text);
}

.task-input-form {
  background-color: var(--surface);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  border: 1px solid var(--border);
}

.task-input-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.add-column-section {
  min-width: 300px;
  max-width: 300px;
  margin-right: var(--spacing-md);
}

.add-column-button {
  height: 48px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  color: var(--text-secondary);
  background-color: rgba(255, 255, 255, 0.03);
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.add-column-button:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--text);
}

.add-column-form {
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  min-width: 300px;
  max-width: 300px;
  border: 1px solid var(--border);
}

.column-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

/* Task Detail Modal */
.task-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: -1;
}

.task-detail-modal {
  background-color: var(--surface);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 48px var(--shadow);
  border: 1px solid var(--border);
  animation: modalEnter 0.3s ease;
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.task-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border);
}

.completion-priority {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.completion-checkbox {
  position: relative;
  display: inline-block;
  width: 22px;
  height: 22px;
  cursor: pointer;
}

.completion-checkbox input {
  opacity: 0;
  width: 0;
  height: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 22px;
  width: 22px;
  background-color: transparent;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.completion-checkbox:hover .checkmark {
  border-color: var(--primary);
}

.completion-checkbox input:checked ~ .checkmark {
  background-color: var(--success);
  border-color: var(--success);
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 7px;
  top: 3px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.completion-checkbox input:checked ~ .checkmark:after {
  display: block;
}

.priority-selector {
  min-width: 100px;
}

.close-button {
  background-color: transparent;
  border: none;
  color: var(--text-secondary);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--text);
}

.task-content-field {
  padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md);
}

.task-title-input {
  font-size: 20px;
  font-weight: 600;
  padding: var(--spacing-sm) var(--spacing-sm);
  border: none;
  border-radius: 0;
  background-color: transparent;
  border-bottom: 1px solid transparent;
  transition: all var(--transition-fast);
}

.task-title-input:focus {
  border-color: var(--border);
  box-shadow: none;
}

.task-meta-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-lg) var(--spacing-md);
  font-size: 12px;
  color: var(--text-secondary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-label {
  font-weight: 500;
}

.tab-navigation {
  display: flex;
  padding: 0 var(--spacing-lg);
  border-bottom: 1px solid var(--border);
  gap: var(--spacing-sm);
}

.tab-button {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  font-weight: 500;
  border-radius: 0;
  transition: all var(--transition-fast);
}

.tab-button:hover {
  color: var(--text);
}

.tab-button.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.tab-content {
  padding: var(--spacing-lg);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-size: 14px;
  font-weight: 500;
}

.form-row {
  display: flex;
  gap: var(--spacing-md);
}

.form-row .form-group {
  flex: 1;
}

.labels-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.label-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px 4px 12px;
  background-color: rgba(118, 74, 188, 0.1);
  color: var(--primary);
  border-radius: 16px;
  font-size: 13px;
}

.empty-state {
  color: var(--text-secondary);
  font-style: italic;
  font-size: 14px;
}

.remove-label {
  background-color: transparent;
  color: var(--primary);
  padding: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 18px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-label:hover {
  background-color: rgba(118, 74, 188, 0.2);
}

.add-label-input {
  display: flex;
  gap: var(--spacing-sm);
}

.task-assigned {
  margin: var(--spacing-lg);
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border);
}

.primary-actions {
  display: flex;
  gap: var(--spacing-sm);
} */
```