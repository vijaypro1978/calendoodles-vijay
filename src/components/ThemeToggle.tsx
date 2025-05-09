
import { useState, useEffect } from 'react';
import { Moon, Sun, Stars } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Default to light mode
    if (typeof window !== 'undefined') {
      // Check for stored preference
      const storedTheme = window.localStorage.getItem('theme');
      if (storedTheme) {
        return storedTheme === 'dark';
      }
      // Default to light mode
      return false;
    }
    return false;
  });

  useEffect(() => {
    // Update the class on the html element
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Set light mode on initial load
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    setIsDarkMode(false);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme} 
      className="rounded-full transition-all duration-500 relative overflow-hidden hover:scale-110 active:scale-90"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="relative z-10">
        {isDarkMode ? (
          <div className="relative">
            <div className="absolute inset-0 bg-calendoodle-blue/30 dark:bg-calendoodle-blue rounded-full opacity-30 animate-pulse-glow"></div>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <Stars className="h-3 w-3 absolute text-white opacity-70 animate-ping" style={{ top: '15%', left: '20%' }} />
              <Stars className="h-2 w-2 absolute text-white opacity-50 animate-ping" style={{ top: '40%', right: '25%', animationDelay: '0.5s' }} />
            </div>
            <Moon className="h-5 w-5 transition-transform rotate-0 scale-100 text-calendoodle-blue dark:text-white filter drop-shadow-[0_0_5px_rgba(52,152,219,0.8)]" />
          </div>
        ) : (
          <div className="relative">
            <div className="absolute inset-0 bg-calendoodle-orange/40 rounded-full opacity-30 animate-pulse-glow"></div>
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute h-1.5 w-1.5 bg-yellow-200 rounded-full opacity-70 animate-ping" style={{ top: '15%', right: '25%' }}></div>
              <div className="absolute h-1 w-1 bg-yellow-200 rounded-full opacity-50 animate-ping" style={{ bottom: '20%', left: '25%', animationDelay: '0.7s' }}></div>
            </div>
            <Sun className="h-5 w-5 transition-transform rotate-0 scale-100 text-calendoodle-orange" />
          </div>
        )}
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
