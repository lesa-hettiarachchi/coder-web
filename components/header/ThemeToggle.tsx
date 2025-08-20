'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="relative w-6 h-6 cursor-pointer" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <div
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-6 h-6 cursor-pointer"
      aria-label="Toggle theme"
      tabIndex={0}
      role="button"
    >
      <Sun
        className={`absolute inset-0 text-yellow-500 transition-all duration-400 transform ${
          isDark ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'
        }`}
      />
      <Moon
        className={`absolute inset-0 text-blue-300 transition-all duration-400 transform ${
          isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'
        }`}
      />
    </div>
  );
};

export default ThemeToggle;
