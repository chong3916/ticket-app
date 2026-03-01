import { useWorkspaceTickets } from "@/context/WorkspaceTicketsContext.tsx";
import { useApi } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/context/WorkspaceContext";
import { toast } from "sonner";
import { useWorkspaceBoard } from "@/hooks/useWorkspaceBoard.ts";
import { BoardColumn } from "@/components/BoardColumn.tsx";
import { AddColumnButton } from "@/components/AddColumnButton.tsx";
import { useState } from "react";
import { CreateTicketDrawer } from "@/components/CreateTicketDrawer.tsx";

export const TicketBoard = () => {
    const { currentWorkspace } = useWorkspace();
    const { data: board, isLoading: boardLoading } = useWorkspaceBoard();
    const { data: tickets, isLoading: ticketsLoading } = useWorkspaceTickets();
    const { secureFetch } = useApi();
    const queryClient = useQueryClient();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activeStatus, setActiveStatus] = useState<string | undefined>();

    const handleCreateClick = (status: string) => {
        setActiveStatus(status);
        setIsDrawerOpen(true);
    };

    const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
        const queryKey = ['tickets', currentWorkspace?.id];
        const previousTickets = queryClient.getQueryData(queryKey);

        queryClient.setQueryData(queryKey, (old: any[]) => {
            return old.map(t => t.id === ticketId ? { ...t, status: newStatus } : t);
        });

        try {
            const res = await secureFetch(`/api/tickets/${ticketId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error();

            queryClient.invalidateQueries({ queryKey });
            toast.success("Status updated");
        } catch (err) {
            queryClient.setQueryData(queryKey, previousTickets);
            toast.error("Failed to update status. Rolling back...");
        }
    };

    const handleAddColumn = async (name: string) => {
        if (!name.trim()) return;

        const statusKey = name.toLowerCase().replace(/\s+/g, '_');

        const res = await secureFetch(`/api/workspaces/${currentWorkspace?.id}/board/columns`, {
            method: 'POST',
            body: JSON.stringify({ name, status_key: statusKey }),
        });

        if (res.ok) {
            queryClient.invalidateQueries({ queryKey: ['board', currentWorkspace?.id] });
            toast.success("Column added!");
        }
    };

    if (!currentWorkspace) return <div className="p-8 text-center text-muted-foreground">Select a workspace to view the board.</div>;
    if (boardLoading || ticketsLoading) return <div>Loading...</div>;

    if (!board || !board.columns) {
        return (
            <div className="p-8 text-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">No board configuration found for this workspace.</p>
                <AddColumnButton onAdd={handleAddColumn} />
            </div>
        );
    }
    
    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-[900px]">
                {board?.columns?.map((col: any) => (
                    <BoardColumn
                        key={col.id}
                        title={col.name}
                        statusKey={col.status_key}
                        tickets={tickets?.filter((t: any) => t.status === col.status_key) || []}
                        onMoveTicket={handleUpdateStatus}
                        onCreateTicket={handleCreateClick}
                    />
                ))}
                <AddColumnButton onAdd={handleAddColumn} />
            </div>

            <CreateTicketDrawer
                open={isDrawerOpen}
                setOpen={setIsDrawerOpen}
                defaultStatus={activeStatus}
                onTodoCreated={() => queryClient.invalidateQueries({ queryKey: ['tickets', currentWorkspace?.id] })}
            />
        </div>
    );
};