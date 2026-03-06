import { useWorkspace } from "@/context/WorkspaceContext";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Layout, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CreateWorkspaceDrawer } from "@/components/CreateWorkspaceDrawer";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AcceptInviteDialog } from "@/components/AcceptInviteDialog.tsx";


export const WorkspacesPage = () => {
    const { workspaces, invitations, isLoading } = useWorkspace();
    const navigate = useNavigate();
    const [selectedInvite, setSelectedInvite] = useState<any>(null);

    if (isLoading) return <div className="p-8">Loading workspaces...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Your Workspaces</h1>
                </div>
            </div>

            {/* Invitations */}
            {invitations.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Pending Invitations ({invitations.length})
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {invitations.map((invite) => (
                            <Card
                                key={invite.id}
                                className="border-primary/50 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
                                onClick={() => setSelectedInvite(invite)}
                            >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div>
                                        <CardTitle className="text-md">{invite.workspace_name}</CardTitle>
                                        <CardDescription>Invited by {invite.inviter_name}</CardDescription>
                                    </div>
                                    <Button size="sm">View Invite</Button>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {selectedInvite && (
                <AcceptInviteDialog
                    invite={selectedInvite}
                    open={!!selectedInvite}
                    onOpenChange={(open: boolean) => !open && setSelectedInvite(null)}
                />
            )}

            {workspaces.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-white">
                    <Layout className="h-12 w-12 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold">No workspaces yet</h2>
                    <p className="text-muted-foreground mb-6">Create your first workspace to get started.</p>
                    <CreateWorkspaceDrawer />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {workspaces.map((ws) => (
                        <Card
                            key={ws.id}
                            className="hover:border-primary cursor-pointer transition-all group"
                            onClick={() => navigate(`/workspaces/${ws.id}/board`)}
                        >
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                        <Layout className="h-5 w-5" />
                                    </div>
                                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <CardTitle className="mt-4">{ws.name}</CardTitle>
                                <CardDescription>Workspace ID: {ws.id.slice(0, 8)}...</CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};