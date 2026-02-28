import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useUserWorkspaces } from "@/hooks/useUserWorkspaces.ts";
import { Building2 } from "lucide-react";
import { CreateWorkspaceDrawer } from "@/components/CreateWorkspaceDrawer.tsx";

export const WorkspaceSwitcher = () => {
    const { currentWorkspace, setWorkspace } = useWorkspace();
    const { data: workspaces, isLoading } = useUserWorkspaces();

    if (isLoading) return <div className="h-10 w-full animate-pulse bg-muted rounded-md" />;

    return (
        <div className="flex flex-col gap-2 p-4">
            <label className="text-xs font-medium text-muted-foreground uppercase">
                Workspace
            </label>
            <Select
                value={currentWorkspace?.id}
                onValueChange={(id) => {
                    const selected = workspaces?.find((w: any) => w.id === id);
                    if (selected) setWorkspace(selected);
                }}
            >
                <SelectTrigger className="w-full flex gap-2">
                    <Building2 className="h-4 w-4" />
                    <SelectValue placeholder="Select Workspace" />
                </SelectTrigger>
                <SelectContent>
                    {workspaces?.map((ws: any) => (
                        <SelectItem key={ws.id} value={ws.id}>
                            {ws.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <div className="mt-1">
                <CreateWorkspaceDrawer />
            </div>
        </div>
    );
};