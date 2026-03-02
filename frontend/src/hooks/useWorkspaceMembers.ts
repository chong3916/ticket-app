import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/hooks/useApi";
import { useWorkspace } from "@/context/WorkspaceContext";

export const useWorkspaceMembers = () => {
    const { secureFetch } = useApi();
    const { currentWorkspace } = useWorkspace();

    return useQuery({
        queryKey: ["workspace-members", currentWorkspace?.id],
        queryFn: async () => {
            if (!currentWorkspace?.id) return [];

            const res = await secureFetch(`/api/workspaces/${currentWorkspace.id}/members`);
            if (!res.ok) throw new Error("Failed to fetch members");

            return res.json();
        },
        enabled: !!currentWorkspace?.id,
    });
};