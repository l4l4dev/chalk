// src/utils/themeManager.js
export const THEMES = {
    DARK: 'dark',
    LIGHT: 'light',
    NEON: 'neon'  
  };
  
  export const initializeTheme = () => {
    const savedTheme = localStorage.getItem('chalk-theme') || THEMES.DARK;
    applyTheme(savedTheme);
    return savedTheme;
  };
  
  export const applyTheme = (theme) => {
    document.documentElement.classList.remove(THEMES.DARK, THEMES.LIGHT, THEMES.NEON);
    
    document.documentElement.classList.add(theme);
    
    localStorage.setItem('chalk-theme', theme);
    
    switch(theme) {
      case THEMES.LIGHT:
        document.documentElement.style.setProperty('--bg-primary', '#f9fafb');
        document.documentElement.style.setProperty('--bg-secondary', '#f3f4f6');
        document.documentElement.style.setProperty('--text-primary', '#111827');
        document.documentElement.style.setProperty('--text-secondary', '#4b5563');
        document.documentElement.style.setProperty('--border-color', '#d1d5db');
        break;
      case THEMES.NEON:
        document.documentElement.style.setProperty('--bg-primary', '#0f172a');
        document.documentElement.style.setProperty('--bg-secondary', '#1e293b');
        document.documentElement.style.setProperty('--text-primary', '#f0f9ff');
        document.documentElement.style.setProperty('--text-secondary', '#94a3b8');
        document.documentElement.style.setProperty('--border-color', '#334155');
        break;
      case THEMES.DARK:
      default:
        document.documentElement.style.setProperty('--bg-primary', '#111827');
        document.documentElement.style.setProperty('--bg-secondary', '#1f2937');
        document.documentElement.style.setProperty('--text-primary', '#f9fafb');
        document.documentElement.style.setProperty('--text-secondary', '#d1d5db');
        document.documentElement.style.setProperty('--border-color', '#374151');
        break;
    }
  };