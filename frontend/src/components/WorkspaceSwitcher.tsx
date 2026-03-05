import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Building2 } from "lucide-react";
import { CreateWorkspaceDrawer } from "@/components/CreateWorkspaceDrawer.tsx";
import { useNavigate } from "react-router-dom";

export const WorkspaceSwitcher = () => {
    const { currentWorkspace, setWorkspace, workspaces, isLoading } = useWorkspace();
    const navigate = useNavigate();

    if (isLoading) {
        return <div className="h-10 w-full animate-pulse bg-muted rounded-md" />;
    }

    return (
        <div className="flex flex-col gap-2 p-4" key={currentWorkspace?.id || "empty"}>
            <label className="text-xs font-medium text-muted-foreground uppercase">
                Workspace
            </label>
            <Select
                key={currentWorkspace?.id || "empty"}
                value={currentWorkspace?.id || ""}
                onValueChange={(id) => {
                    if (!id) return;
                    const selected = workspaces?.find((w: any) => w.id === id);
                    if (selected) {
                        setWorkspace(selected);
                        navigate(`/workspaces/${id}/board`);
                    }
                }}
            >
                <SelectTrigger className="w-full flex gap-2">
                    <Building2 className="h-4 w-4" />
                    <SelectValue placeholder="Select Workspace" />
                </SelectTrigger>
                <SelectContent position="popper" className="w-[var(--radix-select-trigger-width)]">
                    {workspaces?.map((ws: any) => (
                        <SelectItem key={ws.id} value={ws.id} className="w-full">
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