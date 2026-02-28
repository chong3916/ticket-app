import { useWorkspaceTickets } from "@/context/WorkspaceTicketsContext.tsx";
import { TicketCard } from "@/components/TicketCard.tsx";
import { useApi } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/context/WorkspaceContext";
import { toast } from "sonner";

// Define your lifecycle statuses
const COLUMNS = [
    { id: 'todo', label: 'To Do' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'done', label: 'Done' }
];

export const TicketBoard = () => {
    const { currentWorkspace } = useWorkspace();
    const { data: tickets, isLoading } = useWorkspaceTickets();
    const { secureFetch } = useApi();
    const queryClient = useQueryClient();

    const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
        const res = await secureFetch(`/api/tickets/${ticketId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus }),
        });

        if (res.ok) {
            await queryClient.invalidateQueries({ queryKey: ['tickets', currentWorkspace?.id] });
        } else {
            toast.error("Failed to update status");
        }
    };

    if (!currentWorkspace) return <div className="p-8 text-center text-muted-foreground">Select a workspace to view the board.</div>;
    if (isLoading) return <div className="p-8 text-center">Loading board...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COLUMNS.map((col) => (
                <div key={col.id} className="flex flex-col bg-slate-50/50 rounded-xl p-4 min-h-[500px] border">
                    <div className="flex justify-between items-center mb-4 px-1">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-600">
                            {col.label}
                        </h3>
                        <span className="text-xs font-mono bg-white border px-2 py-0.5 rounded-full shadow-sm">
                            {tickets?.filter((t: any) => t.status === col.id).length || 0}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {tickets?.filter((t: any) => t.status === col.id).map((ticket: any) => (
                            <TicketCard
                                key={ticket.id}
                                ticket={ticket}
                                onMove={(status) => handleUpdateStatus(ticket.id, status)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};