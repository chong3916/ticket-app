import { createContext, useContext } from 'react';
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

export const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext);
    if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider');
    return context;
};