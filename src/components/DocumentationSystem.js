// src/components/DocumentationSystem.js
import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const DocumentationSystem = ({
    workspaceItems,
    tasks,
    onCreateDocument,
    onUpdateDocument,
    onLinkTaskToDocument,
    currentBoardId
  }) => {
    const [documents, setDocuments] = useState([]);
    const [currentDocId, setCurrentDocId] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [markdownContent, setMarkdownContent] = useState('');
    const [linkedTasks, setLinkedTasks] = useState([]);
  
  useEffect(() => {
    const docs = workspaceItems.filter(item => item.type === 'note');
    setDocuments(docs);
    
    if (docs.length > 0 && !currentDocId) {
      setCurrentDocId(docs[0].id);
      setMarkdownContent(docs[0].content);
    }
  }, [workspaceItems, currentDocId]);
  
  useEffect(() => {
    if (currentDocId) {
      const doc = documents.find(d => d.id === currentDocId);
      if (doc) {
        const taskRefs = findTaskReferences(doc.content, tasks);
        setLinkedTasks(taskRefs);
      }
    }
  }, [currentDocId, documents, tasks]);
  
  const findTaskReferences = (content, allTasks) => {
    const taskIds = [];
    const taskTitles = [];
    
    const idMatches = content.match(/#task-([a-zA-Z0-9-]+)/g) || [];
    idMatches.forEach(match => {
      const id = match.substring(6);
      taskIds.push(id);
    });
    
    const titleRegex = /\[\[(.*?)\]\]/g;
    let match;
    while ((match = titleRegex.exec(content)) !== null) {
      taskTitles.push(match[1]);
    }
    
    return allTasks.filter(task => {
      return taskIds.includes(task.id) || 
             taskTitles.some(title => task.content.toLowerCase() === title.toLowerCase());
    });
  };
  
  const handleSaveDocument = () => {
    if (currentDocId) {
      onUpdateDocument(currentDocId, { content: markdownContent });
      setEditMode(false);
    } else {
      const newId = onCreateDocument('note', markdownContent, { 
        boardId: currentBoardId,
        isDocumentation: true
      });
      setCurrentDocId(newId);
      setEditMode(false);
    }
  };
  
  const renderDocContent = () => {
    if (!markdownContent) return <div className="empty-doc">No content yet</div>;
    
    let processedContent = markdownContent;
    
    processedContent = processedContent.replace(
      /#task-([a-zA-Z0-9-]+)/g, 
      '<a href="#" class="task-link" data-task-id="$1">#task-$1</a>'
    );
    
    tasks.forEach(task => {
      const regex = new RegExp(`\\[\\[(${task.content})\\]\\]`, 'g');
      processedContent = processedContent.replace(
        regex,
        `<a href="#" class="task-link" data-task-id="${task.id}">$1</a>`
      );
    });
    
    const html = marked(processedContent);
    
    const sanitized = DOMPurify.sanitize(html);
    
    return (
      <div 
        className="doc-content" 
        dangerouslySetInnerHTML={{ __html: sanitized }}
        onClick={handleDocumentClick}
      />
    );
  };
  
  const handleDocumentClick = (e) => {
    if (e.target.classList.contains('task-link')) {
      e.preventDefault();
      const taskId = e.target.getAttribute('data-task-id');
    }
  };
  
  return (
    <div className="flex h-full bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="w-60 bg-gray-850 border-r border-gray-700 p-4 overflow-y-auto">
        <h3 className="text-white font-medium text-lg mb-4">Documents</h3>
        <ul className="space-y-2 mb-4">
          {documents.map(doc => (
            <li 
              key={doc.id} 
              className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${
                doc.id === currentDocId 
                  ? 'bg-indigo-900/30 text-indigo-300' 
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
              onClick={() => {
                setCurrentDocId(doc.id);
                setMarkdownContent(doc.content);
                setEditMode(false);
              }}
            >
              {doc.title || 'Untitled Document'}
            </li>
          ))}
        </ul>
        <button 
          onClick={() => {
            setCurrentDocId(null);
            setMarkdownContent('');
            setEditMode(true);
          }}
          className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
        >
          New Document
        </button>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {editMode ? (
          <div className="flex flex-col h-full">
            <textarea
              value={markdownContent}
              onChange={(e) => setMarkdownContent(e.target.value)}
              placeholder="Write your documentation in Markdown..."
              className="flex-1 p-4 bg-gray-800 text-white font-mono resize-none focus:outline-none"
            />
            <div className="p-3 border-t border-gray-700 flex justify-end space-x-2">
              <button
                onClick={handleSaveDocument}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="p-3 border-b border-gray-700 flex justify-end">
              <button
                onClick={() => setEditMode(true)}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors text-sm"
              >
                Edit
              </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto prose prose-invert prose-sm max-w-none">
              {markdownContent ? 
                renderDocContent() : 
                <div className="text-center py-12 text-gray-500 italic">No content yet</div>
              }
            </div>
          </div>
        )}
      </div>
      
      {linkedTasks.length > 0 && (
        <div className="w-60 bg-gray-850 border-l border-gray-700 p-4 overflow-y-auto">
          <h3 className="text-white font-medium text-lg mb-4">Linked Tasks</h3>
          <ul className="space-y-2">
            {linkedTasks.map(task => (
              <li 
                key={task.id}
                className="bg-gray-800 rounded-md p-2 hover:bg-gray-750 transition-colors"
              >
                <div className="text-sm text-white truncate mb-1">{task.content}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  task.completed ? 'bg-emerald-900/50 text-emerald-300' : 'bg-gray-700 text-gray-400'
                }`}>
                  {task.completed ? 'Done' : 'Open'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DocumentationSystem;