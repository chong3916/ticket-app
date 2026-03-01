import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Ensure you have this shadcn component
import { useApi } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, User, AlignLeft, Loader2 } from "lucide-react";

export const TicketCard = ({ ticket }: { ticket: any }) => {
    const { secureFetch } = useApi();
    const queryClient = useQueryClient();
    const [isUpdating, setIsUpdating] = useState(false);

    // Helper to update any field
    const handleUpdate = async (field: string, value: string) => {
        if (ticket[field] === value) return; // Don't update if nothing changed

        setIsUpdating(true);
        try {
            const res = await secureFetch(`/api/tickets/${ticket.id}`, {
                method: "PATCH",
                body: JSON.stringify({ [field]: value }),
            });

            if (!res.ok) throw new Error();

            // Refetch or update cache
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
            toast.success("Updated");
        } catch (err) {
            toast.error("Failed to update");
        } finally {
            setIsUpdating(false);
        }
    };

    const priorityColor = {
        urgent: "bg-red-100 text-red-700 border-red-200",
        high: "bg-orange-100 text-orange-700 border-orange-200",
        medium: "bg-blue-100 text-blue-700 border-blue-200",
        low: "bg-slate-100 text-slate-700 border-slate-200",
    }[ticket.priority as string] || "bg-slate-100";

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Card className="shadow-sm border-slate-200 hover:border-primary/40 transition-all cursor-pointer active:scale-[0.98]">
                    <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                            <h4 className="text-sm font-semibold text-slate-800 leading-tight line-clamp-2">
                                {ticket.title}
                            </h4>
                            <Badge variant="outline" className={`text-[9px] uppercase font-bold shrink-0 ${priorityColor}`}>
                                {ticket.priority}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader className="border-b pb-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge className={priorityColor}>{ticket.priority}</Badge>
                        {isUpdating && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                    </div>
                    {/* Inline Title Edit */}
                    <InlineInput
                        value={ticket.title}
                        onSave={(val) => handleUpdate("title", val)}
                        className="text-xl font-bold"
                    />
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <AlignLeft className="h-4 w-4" />
                            Description
                        </div>
                        {/* Inline Description Edit */}
                        <InlineTextarea
                            value={ticket.description}
                            onSave={(val) => handleUpdate("description", val)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                        <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                                <User className="h-3 w-3" /> Assignee
                            </span>
                            <p className="text-sm">{ticket.assignee_name || "Unassigned"}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 text-nowrap">
                                <Calendar className="h-3 w-3" /> Created
                            </span>
                            <p className="text-sm">
                                {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// --- Inline Editing Sub-Components ---

const InlineInput = ({ value, onSave, className }: { value: string, onSave: (v: string) => void, className?: string }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [current, setCurrent] = useState(value);

    if (isEditing) {
        return (
            <Input
                autoFocus
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                onBlur={() => { setIsEditing(false); onSave(current); }}
                onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget.blur())}
                className={className}
            />
        );
    }
    return (
        <div onDoubleClick={() => setIsEditing(true)} className={`cursor-text hover:bg-slate-50 rounded px-1 -ml-1 transition-colors ${className}`}>
            {value}
        </div>
    );
};

const InlineTextarea = ({ value, onSave }: { value: string, onSave: (v: string) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [current, setCurrent] = useState(value);

    if (isEditing) {
        return (
            <Textarea
                autoFocus
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                onBlur={() => { setIsEditing(false); onSave(current); }}
                className="text-sm min-h-[100px]"
            />
        );
    }
    return (
        <div
            onDoubleClick={() => setIsEditing(true)}
            className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md border italic cursor-text hover:border-primary/30 transition-all"
        >
            {value || "Double-click to add a description..."}
        </div>
    );
};