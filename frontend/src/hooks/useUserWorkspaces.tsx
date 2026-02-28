import { useQuery } from '@tanstack/react-query';
import { useApi } from '../hooks/useApi';

export const useUserWorkspaces = () => {
    const { secureFetch } = useApi();

    return useQuery({
        queryKey: ['user-workspaces'],
        queryFn: async () => {
            const res = await secureFetch('/api/workspaces');
            if (!res.ok) throw new Error('Failed to fetch workspaces');
            return res.json();
        }
    });
};