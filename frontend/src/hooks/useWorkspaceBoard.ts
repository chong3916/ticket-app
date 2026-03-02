import { useQuery } from '@tanstack/react-query';
import { useWorkspace } from '../context/WorkspaceContext';
import { useApi } from '../hooks/useApi';

export const useWorkspaceBoard = () => {
    const { currentWorkspace } = useWorkspace();
    const { secureFetch } = useApi();

    return useQuery({
        queryKey: ['board', currentWorkspace?.id],
        queryFn: async () => {
            const response = await secureFetch(`/api/workspaces/${currentWorkspace?.id}/board`);
            if (!response.ok) throw new Error('Failed to fetch board');
            return response.json();
        },
        enabled: !!currentWorkspace?.id,
        staleTime: 1000 * 60 * 5,
    });
};