import { useState, useEffect } from 'react';

export type ThemeType = 'original' | 'deku' | 'slime' | 'sukuna';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('mangastop_theme');
    return (savedTheme as ThemeType) || 'original';
  });

  const applyThemeToBody = (t: ThemeType) => {
    // Remove old theme classes
    document.body.classList.remove('theme-deku', 'theme-slime', 'theme-sukuna');
    
    // Add new theme class if not original
    if (t !== 'original') {
      document.body.classList.add(`theme-${t}`);
    }
  };

  useEffect(() => {
    applyThemeToBody(theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem('mangastop_theme', newTheme);
    applyThemeToBody(newTheme);
  };

  return { theme, setTheme };
}
