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
  document.body.classList.remove(THEMES.DARK, THEMES.LIGHT, THEMES.NEON);
  document.body.classList.add(theme);
  
  localStorage.setItem('chalk-theme', theme);
  
  switch(theme) { 
    case THEMES.LIGHT:
      document.documentElement.style.setProperty('--bg-primary', '#f0f4f8');   
      document.documentElement.style.setProperty('--bg-secondary', '#e1e8ed'); 
      document.documentElement.style.setProperty('--bg-tertiary', '#d6e0e8');  
      document.documentElement.style.setProperty('--text-primary', '#2d3748'); 
      document.documentElement.style.setProperty('--text-secondary', '#4a5568');
      document.documentElement.style.setProperty('--border-color', '#cbd5e0');
      break;
    case THEMES.NEON:
      document.documentElement.style.setProperty('--bg-primary', '#0a0120');      
      document.documentElement.style.setProperty('--bg-secondary', '#12033a');    
      document.documentElement.style.setProperty('--bg-tertiary', '#1f0650');     
      document.documentElement.style.setProperty('--text-primary', '#00fff2');   
      document.documentElement.style.setProperty('--text-secondary', '#fe01e6');
      document.documentElement.style.setProperty('--border-color', '#39ff14');
      break;
    case THEMES.DARK:
    default:
      document.documentElement.style.setProperty('--bg-primary', '#111827');
      document.documentElement.style.setProperty('--bg-secondary', '#1f2937');
      document.documentElement.style.setProperty('--bg-tertiary', '#374151');
      document.documentElement.style.setProperty('--text-primary', '#f9fafb');
      document.documentElement.style.setProperty('--text-secondary', '#d1d5db');
      document.documentElement.style.setProperty('--border-color', '#374151');
      break;
  }
};