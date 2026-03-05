import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext.tsx";
import { useApi } from "@/hooks/useApi.ts";
import { useInvitations } from "@/hooks/useInvitations.ts";
import { WorkspaceContext } from "./WorkspaceContext";
import { useLocation } from "react-router-dom";

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { pathname } = useLocation();

    const queryClient = useQueryClient();
    const { token } = useAuth();
    const { secureFetch } = useApi();

    const { data: invitations = [], isLoading: isInvitesLoading, refetch: refetchInvitations } = useInvitations();

    const { data: workspaces = [], isLoading: isWorkspacesLoading, refetch: refetchWorkspaces } = useQuery({
        queryKey: ['workspaces'],
        queryFn: async () => {
            const res = await secureFetch("/api/workspaces");
            return res.json();
        },
        enabled: !!token,
    });

    const workspaceIdFromUrl = pathname.match(/\/workspaces\/([^/]+)/)?.[1];

    const currentWorkspace = React.useMemo(() => {
        if (workspaceIdFromUrl) {
            return workspaces.find((w: any) => w.id === workspaceIdFromUrl) || null;
        }
        return null;
    }, [workspaceIdFromUrl, workspaces]);

    const userRole = currentWorkspace?.role || null;

    const clearWorkspace = React.useCallback(() => {
        localStorage.removeItem('active_workspace');
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
    }, [queryClient]);

    return (
        <WorkspaceContext.Provider value={{
            workspaces,
            invitations,
            currentWorkspace,
            userRole,
            isLoading: isWorkspacesLoading,
            isInvitesLoading,
            setWorkspace: (ws) => localStorage.setItem('active_workspace', JSON.stringify(ws)),
            setWorkspaceById: (id: string) => {
                const ws = workspaces.find((w: any) => w.id === id);
                if (ws) localStorage.setItem('active_workspace', JSON.stringify(ws));
            },
            refreshWorkspaces: async () => {
                await Promise.all([refetchWorkspaces(), refetchInvitations()]);
            },
            clearWorkspace
        }}>
            {children}
        </WorkspaceContext.Provider>
    );
};
