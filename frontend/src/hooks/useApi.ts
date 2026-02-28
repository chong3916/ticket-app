import { useAuth } from '../context/AuthContext';

export const useApi = () => {
    const { token, logout } = useAuth();

    const secureFetch = async (url: string, options: RequestInit = {}) => {
        const headers = {
            ...options.headers,
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        };

        const response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            // Handle expired tokens/unauthorized
            logout();
            window.location.href = '/login';
            console.error("Session expired");
        }

        return response;
    };

    return { secureFetch };
};