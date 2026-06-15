import { useState, useEffect } from 'react';

export type ThemeType = 'original' | 'deku' | 'slime' | 'sukuna' | 'custom';

// Helper to convert hex to rgb string for rgba() usage
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
    : '139, 92, 246'; // fallback to purple
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('mangastop_theme');
    return (savedTheme as ThemeType) || 'original';
  });

  const [customColor, setCustomColorState] = useState<string>(() => {
    return localStorage.getItem('mangastop_custom_color') || '#ff5500';
  });

  const applyThemeToBody = (t: ThemeType, color: string) => {
    // Remove old theme classes
    document.body.classList.remove('theme-deku', 'theme-slime', 'theme-sukuna');
    
    // Reset custom properties
    document.body.style.removeProperty('--accent-purple');
    document.body.style.removeProperty('--accent-pink');
    document.body.style.removeProperty('--accent-cyan');
    document.body.style.removeProperty('--accent-gradient');
    document.body.style.removeProperty('--accent-gradient-hover');
    document.body.style.removeProperty('--border-glow');
    
    if (t === 'custom') {
      const rgb = hexToRgb(color);
      document.body.style.setProperty('--accent-purple', color);
      document.body.style.setProperty('--accent-pink', color);
      document.body.style.setProperty('--accent-cyan', color);
      document.body.style.setProperty('--accent-gradient', color);
      document.body.style.setProperty('--accent-gradient-hover', color);
      document.body.style.setProperty('--border-glow', `rgba(${rgb}, 0.4)`);
    } else if (t !== 'original') {
      document.body.classList.add(`theme-${t}`);
    }
  };

  useEffect(() => {
    applyThemeToBody(theme, customColor);
  }, [theme, customColor]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem('mangastop_theme', newTheme);
  };

  const setCustomColor = (newColor: string) => {
    setCustomColorState(newColor);
    localStorage.setItem('mangastop_custom_color', newColor);
    if (theme !== 'custom') {
      setTheme('custom');
    }
  };

  return { theme, setTheme, customColor, setCustomColor };
}
