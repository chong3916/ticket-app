import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/useApi";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DeleteWorkspaceDialog } from "@/components/DeleteWorkspaceDialog";

export const WorkspaceSettingsPage = () => {
    const { id: workspaceId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { secureFetch } = useApi();
    const { currentWorkspace, refreshWorkspaces, setWorkspace, clearWorkspace } = useWorkspace();

    const [name, setName] = useState(currentWorkspace?.name || "");

    useEffect(() => {
        if (currentWorkspace?.name) {
            setName(currentWorkspace.name);
        }
    }, [currentWorkspace?.name]);

    const updateWorkspace = useMutation({
        mutationFn: async (newName: string) => {
            const res = await secureFetch(`/api/workspaces/${workspaceId}`, {
                method: "PATCH",
                body: JSON.stringify({ name: newName })
            });
            if (!res.ok) throw new Error("Failed to update workspace");
        },
        onSuccess: async (_, newName) => {
            queryClient.setQueryData(["workspaces"], (oldData: any) =>
                oldData?.map((ws: any) => ws.id === workspaceId ? { ...ws, name: newName } : ws)
            );

            if (currentWorkspace && workspaceId === currentWorkspace.id) {
                setWorkspace({ ...currentWorkspace, name: newName });
            }

            await queryClient.invalidateQueries({ queryKey: ["workspaces"] });

            if (workspaceId) {
                await refreshWorkspaces(workspaceId);
            }

            toast.success("Workspace updated");
        }
    });

    const deleteWorkspace = useMutation({
        mutationFn: async () => {
            const res = await secureFetch(`/api/workspaces/${workspaceId}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Failed to delete workspace");
        },
        onSuccess: () => {
            toast.success("Workspace deleted");

            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
            clearWorkspace();

            navigate("/workspaces");
        }
    });

    if (currentWorkspace?.role !== "admin") {
        return <div className="p-8 text-center">Only admins can access settings.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage workspace preferences and configuration.</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-0.5">
                        <label className="text-sm font-medium block mb-2" htmlFor="workspace-name">Workspace Name</label>
                        <div className="flex gap-2">
                            <Input
                                id="workspace-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="max-w-md"
                            />
                            <Button
                                onClick={() => updateWorkspace.mutate(name)}
                                disabled={updateWorkspace.isPending || name === currentWorkspace?.name}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50/30">
                <CardHeader>
                    <CardTitle className="text-red-600 text-lg">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                            <p className="text-sm font-semibold">Delete Workspace</p>
                            <p className="text-sm text-muted-foreground">Permanently delete this workspace and all of its data. This action cannot be undone.</p>
                        </div>
                        <DeleteWorkspaceDialog
                            onDelete={() => deleteWorkspace.mutate()}
                            isPending={deleteWorkspace.isPending}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};