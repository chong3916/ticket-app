import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from "@/context/AuthContext.tsx";
import { useApi } from "@/hooks/useApi.ts";
import { useInvitations } from "@/hooks/useInvitations.ts";
import type { Workspace } from '@/types/workspace';
import type { Invitation } from "@/types/invitation.ts";

interface WorkspaceContextType {
    workspaces: Workspace[];
    invitations: Invitation[];
    currentWorkspace: Workspace | null;
    userRole: string | null;
    isLoading: boolean;
    isInvitesLoading: boolean;
    setWorkspace: (workspace: Workspace) => void;
    setWorkspaceById: (id: string) => void;
    refreshWorkspaces: (targetId?: string) => Promise<void>;
    clearWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token } = useAuth();
    const { secureFetch } = useApi();
    const { data: invitations = [], isLoading: isInvitesLoading } = useInvitations();

    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(() => {
        const saved = localStorage.getItem('active_workspace');
        return saved ? JSON.parse(saved) : null;
    });
    const [userRole, setUserRole] = useState<'admin' | 'member' | 'viewer' | null>(() => {
        const saved = localStorage.getItem('active_workspace');
        if (saved) {
            const parsed = JSON.parse(saved) as Workspace;
            return parsed.role;
        }
        return null;
    });

    const refreshWorkspaces = async (targetId?: string) => {
        if (!token) return;
        try {
            const res = await secureFetch("/api/workspaces");
            const data = await res.json();
            setWorkspaces(data);

            setCurrentWorkspace((prev) => {
                const idToSync = targetId || prev?.id;
                if (idToSync) {
                    const updated = data.find((w: any) => w.id === idToSync);
                    if (updated) {
                        localStorage.setItem('active_workspace', JSON.stringify(updated));
                        setUserRole(updated.role);
                        return { ...updated };
                    }
                }
                return prev;
            });
        } catch (err) {
            console.error("Failed to fetch workspaces", err);
        } finally {
            setIsLoading(false);
        }
    };

    const setWorkspace = React.useCallback((workspace: Workspace) => {
        localStorage.setItem('active_workspace', JSON.stringify(workspace));
        setCurrentWorkspace(workspace);
        setUserRole(workspace.role);
    }, []);

    const clearWorkspace = () => {
        localStorage.removeItem('active_workspace');
        setCurrentWorkspace(null);
        setWorkspaces([]);
    };

    useEffect(() => {
        if (token) {
            refreshWorkspaces();
        } else {
            clearWorkspace();
        }
    }, [token]);

    return (
        <WorkspaceContext.Provider value={{
            workspaces,
            invitations,
            currentWorkspace,
            userRole,
            isLoading,
            isInvitesLoading,
            setWorkspace,
            setWorkspaceById: (id: string) => {
                const ws = workspaces.find(w => w.id === id);
                if (ws) setWorkspace(ws);
            },
            refreshWorkspaces,
            clearWorkspace
        }}>
            {children}
        </WorkspaceContext.Provider>
    );
};

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext);
    if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider');
    return context;
};