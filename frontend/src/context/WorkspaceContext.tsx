import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from "@/context/AuthContext.tsx";

interface Workspace {
    id: string;
    name: string;
}

interface WorkspaceContextType {
    currentWorkspace: Workspace | null;
    setWorkspace: (workspace: Workspace) => void;
    clearWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token } = useAuth();

    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(() => {
        const saved = localStorage.getItem('active_workspace');
        return saved ? JSON.parse(saved) : null;
    });

    const setWorkspace = (workspace: Workspace) => {
        localStorage.setItem('active_workspace', JSON.stringify(workspace));
        setCurrentWorkspace(workspace);
    };

    const clearWorkspace = () => {
        localStorage.removeItem('active_workspace');
        setCurrentWorkspace(null);
    };

    useEffect(() => {
        if (!token) {
            clearWorkspace();
        }
    }, [token]);

    return (
        <WorkspaceContext.Provider value={{ currentWorkspace, setWorkspace, clearWorkspace }}>
            {children}
        </WorkspaceContext.Provider>
    );
};

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext);
    if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider');
    return context;
};