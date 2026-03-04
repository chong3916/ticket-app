import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from "@/context/AuthContext.tsx";
import { useApi } from "@/hooks/useApi.ts";
import { useInvitations } from "@/hooks/useInvitations.ts";

interface Workspace {
    id: string;
    name: string;
}

interface Invitation {
    id: string;
    workspace_name: string;
    inviter_name: string;
}

interface WorkspaceContextType {
    workspaces: Workspace[];
    invitations: Invitation[];
    currentWorkspace: Workspace | null;
    isLoading: boolean;
    isInvitesLoading: boolean;
    setWorkspace: (workspace: Workspace) => void;
    setWorkspaceById: (id: string) => void;
    refreshWorkspaces: () => Promise<void>;
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

    const refreshWorkspaces = async () => {
        if (!token) return;
        try {
            const res = await secureFetch("/api/workspaces");
            const data = await res.json();
            setWorkspaces(data);
        } catch (err) {
            console.error("Failed to fetch workspaces", err);
        } finally {
            setIsLoading(false);
        }
    };

    const setWorkspace = (workspace: Workspace) => {
        localStorage.setItem('active_workspace', JSON.stringify(workspace));
        setCurrentWorkspace(workspace);
    };

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