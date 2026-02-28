import { useQuery } from '@tanstack/react-query';
import { useWorkspace } from '../context/WorkspaceContext';
import { useApi } from '../hooks/useApi';

export const useWorkspaceTickets = () => {
    const { currentWorkspace } = useWorkspace();
    const { secureFetch } = useApi();

    return useQuery({
        queryKey: ['tickets', currentWorkspace?.id],

        queryFn: async () => {
            const response = await secureFetch(`/api/workspaces/${currentWorkspace?.id}/tickets`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch tickets');
            }

            return response.json();
        },

        enabled: !!currentWorkspace?.id,
    });
};