const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  // Initialize mainWindow as a new BrowserWindow instance
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true, // Allows renderer process to use Node.js APIs (use cautiously)
      contextIsolation: false // Disables context isolation (consider enabling for security)
    }
  });

  // Load index.html into the window
  mainWindow.loadFile('index.html').then(() => {
    console.log('index.html loaded successfully');
  }).catch(err => {
    console.error('Error loading index.html:', err);
  });

  // Open DevTools in development mode
  if (process.env.NODE_ENV !== 'production') {
    mainWindow.webContents.openDevTools();
  }

  // mainWindow.show() is optional; windows are visible by default unless hidden
}

// Wait until the app is ready, then create the window
app.whenReady().then(() => {
  createWindow();
});

// Quit the app when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Re-create the window on macOS if the dock icon is clicked and no windows are open
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});