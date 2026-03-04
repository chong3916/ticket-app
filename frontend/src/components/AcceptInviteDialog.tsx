import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useWorkspace } from "@/context/WorkspaceContext";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MailOpen, Loader2 } from "lucide-react";

export const AcceptInviteDialog = ({ invite, open, onOpenChange }: any) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { secureFetch } = useApi();
    const { refreshWorkspaces, refreshInvitations } = useWorkspace();

    const handleAccept = async () => {
        setIsSubmitting(true);
        try {
            const res = await secureFetch("/api/invites/accept", {
                method: "POST",
                body: JSON.stringify({ token: invite.token }),
            });

            if (!res.ok) throw new Error("Failed to join workspace");

            toast.success(`Joined ${invite.workspace_name}!`);
            await refreshWorkspaces();
            await refreshInvitations();
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                        <MailOpen className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="text-center">Join Workspace</DialogTitle>
                    <DialogDescription className="text-center">
                        You've been invited to join <span className="font-bold text-foreground">{invite.workspace_name}</span>.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                        Ignore
                    </Button>
                    <Button className="flex-1" onClick={handleAccept} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Accept Invitation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};