import { LayoutDashboard } from "lucide-react";

export const EmptyState = () => {
    return (
        <div className="flex h-[80vh] flex-col items-center justify-center text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
                <LayoutDashboard className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">No Workspaces Found</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
                You need to be part of a workspace to manage tickets.
                Create your first one to get started.
            </p>
        </div>
    );
};