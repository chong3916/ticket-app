import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
} from "@/components/ui/dialog";
import { Calendar, User, Loader2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { InlineInput, InlineTextarea } from "@/components/InlineInput.tsx";

const priorities = ["low", "medium", "high", "urgent"];

export const TicketDialog = ({ ticket, board, open, onOpenChange }: { ticket: any, board?: any, open: boolean; onOpenChange: (open: boolean) => void }) => {
    const { secureFetch } = useApi();
    const queryClient = useQueryClient();
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async (field: string, value: string) => {
        if (ticket[field] === value) return;

        const queryKey = ["tickets", ticket.workspace_id];

        const previousTickets = queryClient.getQueryData(queryKey);

        queryClient.setQueryData(queryKey, (old: any[] | undefined) => {
            if (!old) return [];
            return old.map((t) =>
                t.id === ticket.id ? { ...t, [field]: value } : t
            );
        });

        setIsUpdating(true);
        try {
            const res = await secureFetch(`/api/tickets/${ticket.id}`, {
                method: "PATCH",
                body: JSON.stringify({ [field]: value }),
            });

            if (!res.ok) throw new Error();
            toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated`);
        } catch (err) {
            queryClient.setQueryData(queryKey, previousTickets);
            toast.error("Failed to update");
        } finally {
            setIsUpdating(false);
        }
    };

    if (!ticket) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader className="border-b pb-4">
                    {/* Edit title */}
                    <InlineInput
                        value={ticket.title}
                        onSave={(val) => handleUpdate("title", val)}
                        className="text-xl font-bold"
                    />
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            Description
                        </div>
                        {/* Edit ticket description */}
                        <InlineTextarea
                            value={ticket.description}
                            onSave={(val) => handleUpdate("description", val)}
                        />
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                        {/* Priority Selector */}
                        <Select
                            value={ticket.priority}
                            onValueChange={(val) => handleUpdate("priority", val)}
                        >
                            <SelectTrigger className="w-[110px] h-7 text-[10px] uppercase font-bold`}">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {priorities.map(p => (
                                    <SelectItem key={p} value={p} className="text-xs uppercase">
                                        {p}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Status Selector */}
                        <Select
                            value={ticket.status}
                            onValueChange={(val) => handleUpdate("status", val)}
                        >
                            <SelectTrigger className="w-[140px] h-7 text-[10px] uppercase font-bold">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {board?.columns?.map((col: any) => (
                                    <SelectItem key={col.status_key} value={col.status_key} className="text-xs">
                                        {col.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {isUpdating && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
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