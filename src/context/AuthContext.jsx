import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/client';
import { connectSocket, disconnectSocket } from '../api/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const s = localStorage.getItem('resqnet_user');
        return s ? JSON.parse(s) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('resqnet_token'));
    const [loading, setLoading] = useState(false);

    // Persist
    useEffect(() => {
        if (user) localStorage.setItem('resqnet_user', JSON.stringify(user));
        else localStorage.removeItem('resqnet_user');
    }, [user]);
    useEffect(() => {
        if (token) localStorage.setItem('resqnet_token', token);
        else localStorage.removeItem('resqnet_token');
    }, [token]);

    // Connect socket on login
    useEffect(() => {
        if (user?._id) connectSocket(user._id);
        return () => { };
    }, [user?._id]);

    const register = useCallback(async (data) => {
        setLoading(true);
        try {
            const res = await authAPI.register(data);
            setToken(res.data.token);
            setUser(res.data.user);
            return res.data;
        } finally { setLoading(false); }
    }, []);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        try {
            const res = await authAPI.login({ email, password });
            setToken(res.data.token);
            setUser(res.data.user);
            return res.data;
        } finally { setLoading(false); }
    }, []);

    const updateUser = useCallback((data) => {
        setUser((prev) => ({ ...prev, ...data }));
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('resqnet_token');
        localStorage.removeItem('resqnet_user');
        disconnectSocket();
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, loading, register, login, updateUser, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
}
