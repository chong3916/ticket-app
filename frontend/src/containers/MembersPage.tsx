import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Mail, ShieldCheck, Loader2, ShieldAlert, Eye } from "lucide-react";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useWorkspace } from "@/context/WorkspaceContext.tsx";
import { RemoveMemberDialog } from "@/components/RemoveMemberDialog.tsx";
import { useNavigate } from "react-router-dom";
import { LeaveWorkspaceDialog } from "@/components/LeaveWorkspaceDialog.tsx";

const RoleBadge = ({ role }: { role: string }) => {
    const configs: Record<string, { icon: any, color: string }> = {
        admin: { icon: ShieldAlert, color: "bg-red-100 text-red-800 border-red-200" },
        member: { icon: ShieldCheck, color: "bg-blue-100 text-blue-800 border-blue-200" },
        viewer: { icon: Eye, color: "bg-slate-100 text-slate-800 border-slate-200" },
    };

    const config = configs[role] || configs.viewer;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${config.color}`}>
            <Icon className="h-3 w-3" /> {role}
        </span>
    );
};

export const MembersPage = () => {
    const { id: workspaceId } = useParams();
    const { currentWorkspace, refreshWorkspaces, clearWorkspace } = useWorkspace();
    const { secureFetch } = useApi();
    const navigate = useNavigate();

    const queryClient = useQueryClient();
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("member");
    const [isInviting, setIsInviting] = useState(false);

    const isAdmin = currentWorkspace?.role === 'admin';

    // Fetch members
    const { data: members, isLoading } = useQuery({
        queryKey: ["members", workspaceId],
        queryFn: async () => {
            const res = await secureFetch(`/api/workspaces/${workspaceId}/members`);
            if (!res.ok) throw new Error("Failed to fetch members");
            return res.json();
        },
        enabled: !!workspaceId,
    });

    // Update role mutation
    const updateRoleMutation = useMutation({
        mutationFn: async ({ memberId, role }: { memberId: string, role: string }) => {
            const res = await secureFetch(`/api/workspaces/${workspaceId}/members/${memberId}/role`, {
                method: "PATCH",
                body: JSON.stringify({ role })
            });
            if (!res.ok) throw new Error("Failed to update role");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
            toast.success("Role updated");
        }
    });

    // Remove role mutation
    const removeMemberMutation = useMutation({
        mutationFn: async (memberId: string) => {
            const res = await secureFetch(`/api/workspaces/${workspaceId}/members/${memberId}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Failed to remove member");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
            toast.success("Member removed");
        }
    });

    const leaveWorkspaceMutation = useMutation({
        mutationFn: async () => {
            const res = await secureFetch(`/api/workspaces/${workspaceId}/leave`, {
                method: "POST"
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to leave workspace");
            }
        },
        onSuccess: () => {
            toast.success("You have left the workspace");

            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
            clearWorkspace();
            refreshWorkspaces();

            navigate("/workspaces");
        },
        onError: (err: any) => {
            toast.error(err.message);
        }
    });

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsInviting(true);
        try {
            const res = await secureFetch(`/api/workspaces/${workspaceId}/invite`, {
                method: "POST",
                body: JSON.stringify({ email, role }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to invite member");
            }

            toast.success(`Invitation sent to ${email} as ${role}`);
            setEmail("");
            // Refresh member list
            queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsInviting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Members</h1>
                {isAdmin
                    ? "Manage who has access to this workspace."
                    : "View the team members in this workspace."}
            </header>

            {/* Invite Section */}
            {isAdmin && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <UserPlus className="h-5 w-5" /> Invite New Member
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleInvite} className="flex gap-2">
                            <div className="relative flex-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="colleague@example.com"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>

                            <div className="flex-[1]">
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="viewer">Viewer</SelectItem>
                                        <SelectItem value="member">Member</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button type="submit" disabled={isInviting}>
                                {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Invite
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Members List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Workspace Team</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="divide-y">
                        {members?.map((member: any) => {
                            const isMe = member.id === currentWorkspace?.user_id;

                            return (
                                <div key={ member.id } className="flex items-center justify-between py-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            { (member.username || "U").charAt(0).toUpperCase() }
                                        </div>
                                        <div>
                                            <p className="font-medium">{ member.username }</p>
                                            <p className="text-sm text-muted-foreground">{ member.email }</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 min-w-[160px] justify-end">
                                        {isAdmin ? (
                                            <Select
                                                disabled={isMe}
                                                value={member.role}
                                                onValueChange={(newRole) => updateRoleMutation.mutate({ memberId: member.id, role: newRole })}
                                            >
                                                <SelectTrigger className="w-[110px] h-8 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="viewer">Viewer</SelectItem>
                                                    <SelectItem value="member">Member</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <RoleBadge role={member.role} />
                                        )}

                                        {/* Delete user/leave workspace button */}
                                        {isMe ? (
                                            <LeaveWorkspaceDialog
                                                onLeave={() => leaveWorkspaceMutation.mutate()}
                                                isPending={leaveWorkspaceMutation.isPending}
                                            />
                                        ) : isAdmin ? (
                                            <RemoveMemberDialog member={member} removeMemberMutation={removeMemberMutation} />
                                        ) : (
                                            <div className="w-8" />
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};