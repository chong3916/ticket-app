import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    token: string | null;
    user: User | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(!!token);

    const fetchMe = useCallback(async (authToken: string) => {
        try {
            const res = await fetch('/api/me', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
            } else {
                logout();
            }
        } catch (err) {
            console.error("Auth verification failed", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (token && !user) {
            fetchMe(token);
        } else {
            setIsLoading(false);
        }
    }, [token, user, fetchMe]);

    const login = (newToken: string, userData: User) => {
        localStorage.setItem('jwt_token', newToken);
        setToken(newToken);
        setUser(userData);
        setIsLoading(false);
    };

    const logout = () => {
        localStorage.removeItem('jwt_token');
        setToken(null);
        setUser(null);
        setIsLoading(false);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token && !!user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};