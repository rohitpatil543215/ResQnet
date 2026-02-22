import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [darkMode, setDarkMode] = useState(() => {
        const s = localStorage.getItem('resqnet_dark');
        return s !== null ? s === 'true' : true;
    });

    useEffect(() => {
        localStorage.setItem('resqnet_dark', darkMode);
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    const toggle = () => setDarkMode((p) => !p);

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode: toggle }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
    return ctx;
}
