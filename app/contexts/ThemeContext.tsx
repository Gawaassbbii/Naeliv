"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';
type Language = 'fr' | 'nl' | 'de' | 'en';

interface ThemeContextType {
  theme: Theme;
  language: Language;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [language, setLanguageState] = useState<Language>('fr');
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedLanguage = localStorage.getItem('language') as Language;
    
    if (savedTheme) {
      setThemeState(savedTheme);
    }
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Apply theme to document whenever theme changes
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    
    // Force remove first to ensure clean state
    html.classList.remove('dark', 'light');
    body.classList.remove('dark', 'light');
    
    if (theme === 'dark') {
      html.classList.add('dark');
      body.classList.add('dark');
      // Force style update
      html.style.colorScheme = 'dark';
    } else {
      html.classList.remove('dark');
      body.classList.remove('dark');
      html.style.colorScheme = 'light';
    }
    
    // Force a repaint
    void html.offsetHeight;
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    console.log('🔄 setTheme called with:', newTheme);
    setThemeState(newTheme);
    
    // Apply theme immediately to document (both html and body)
    const html = document.documentElement;
    const body = document.body;
    
    console.log('📝 Before - html classes:', html.className);
    console.log('📝 Before - body classes:', body.className);
    
    // Force remove first
    html.classList.remove('dark', 'light');
    body.classList.remove('dark', 'light');
    
    if (newTheme === 'dark') {
      html.classList.add('dark');
      body.classList.add('dark');
      html.style.colorScheme = 'dark';
      console.log('✅ Added dark class to html and body');
    } else {
      html.classList.remove('dark');
      body.classList.remove('dark');
      html.style.colorScheme = 'light';
      console.log('✅ Removed dark class from html and body');
    }
    
    // Force a repaint to ensure styles are applied
    void html.offsetHeight;
    
    console.log('📝 After - html classes:', html.className);
    console.log('📝 After - body classes:', body.className);
    console.log('🎨 Computed background:', window.getComputedStyle(body).backgroundColor);
    
    // Save to localStorage
    try {
      localStorage.setItem('theme', newTheme);
      console.log('💾 Saved theme to localStorage:', newTheme);
    } catch (e) {
      console.error('❌ Failed to save theme to localStorage:', e);
    }
  };

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    if (mounted) {
      localStorage.setItem('language', newLanguage);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, language, setTheme, setLanguage }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

