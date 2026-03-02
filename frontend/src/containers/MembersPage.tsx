import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Mail, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const MembersPage = () => {
    const { id: workspaceId } = useParams();
    const { secureFetch } = useApi();
    const queryClient = useQueryClient();
    const [email, setEmail] = useState("");
    const [isInviting, setIsInviting] = useState(false);

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

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsInviting(true);
        try {
            const res = await secureFetch(`/api/workspaces/${workspaceId}/invite`, {
                method: "POST",
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to invite member");
            }

            toast.success(`Invitation sent to ${email}`);
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
                <p className="text-muted-foreground">Manage who has access to this workspace.</p>
            </header>

            {/* Invite Section */}
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
                        <Button type="submit" disabled={isInviting}>
                            {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Invite
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Members List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Workspace Team</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="divide-y">
                        {members?.map((member: any) => (
                            <div key={member.id} className="flex items-center justify-between py-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {(member.username || "U").charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium">{member.username}</p>
                                        <p className="text-sm text-muted-foreground">{member.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                                        <ShieldCheck className="h-3 w-3" /> Member
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};