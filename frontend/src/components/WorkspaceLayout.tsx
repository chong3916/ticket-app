import { Outlet, useParams } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { useEffect } from "react";
import { useWorkspace } from "@/context/WorkspaceContext.tsx";

export const WorkspaceLayout = () => {
    const { id } = useParams();
    const { setWorkspaceById, isLoading, currentWorkspace, workspaces } = useWorkspace();

    useEffect(() => {
        if (id && workspaces.length > 0) {
            setWorkspaceById(id);
        }
    }, [id, workspaces, setWorkspaceById]);

    if (isLoading) return <div>Loading Workspace...</div>;

    if (id && !currentWorkspace) return <div>Workspace not found</div>;

    return (
        <div className="flex h-screen w-full bg-slate-50">
            <Sidebar />

            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};