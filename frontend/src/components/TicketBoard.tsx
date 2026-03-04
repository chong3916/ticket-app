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
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
    DragOverlay,
    defaultDropAnimationSideEffects,
    rectIntersection,
    pointerWithin,
} from "@dnd-kit/core";
import { TicketDialog } from "./TicketDialog.tsx";
import { TicketCard } from "@/components/TicketCard.tsx";
import { useWorkspaceMembers } from "@/hooks/useWorkspaceMembers.ts";

export const TicketBoard = () => {
    const { currentWorkspace } = useWorkspace();
    const isAdmin = currentWorkspace?.role === 'admin';

    const { data: board, isLoading: boardLoading } = useWorkspaceBoard();
    const { data: tickets, isLoading: ticketsLoading } = useWorkspaceTickets();
    const { data: members } = useWorkspaceMembers();

    const { secureFetch } = useApi();
    const queryClient = useQueryClient();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activeStatus, setActiveStatus] = useState<string | undefined>();
    const [activeTicket, setActiveTicket] = useState<any | null>(null);

    const [viewingTicketId, setViewingTicketId] = useState<string | null>(null);

    const viewingTicket = tickets?.find((t: any) => t.id === viewingTicketId);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 }
        })
    );

    const handleCreateClick = (status: string) => {
        setActiveStatus(status);
        setIsDrawerOpen(true);
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const ticket = tickets?.find((t: any) => t.id === active.id);
        setActiveTicket(ticket);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTicket(null);

        if (!over) return;

        const ticketId = active.id as string;
        const newStatus = over.id as string;

        const queryKey = ['tickets', currentWorkspace?.id];

        const currentTickets = queryClient.getQueryData<any[]>(queryKey);
        const draggedTicket = tickets?.find((t: any) => t.id === ticketId);

        if (!draggedTicket || draggedTicket.status === newStatus) return;

        queryClient.setQueryData(queryKey, (old: any[] | undefined) => {
            if (!old) return [];
            return old.map(t => t.id === ticketId ? { ...t, status: newStatus } : t);
        });

        try {
            const res = await secureFetch(`/api/tickets/${ticketId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error();
            toast.success(`Moved to ${newStatus}`);
        } catch (err) {
            // Rollback on error
            queryClient.setQueryData(queryKey, currentTickets);
            toast.error("Failed to move ticket");
        }
    };

    const collisionDetectionStrategy = (args: any) => {
        const pointerCollisions = pointerWithin(args);
        if (pointerCollisions.length > 0) return pointerCollisions;

        // If no pointer collision, use rectIntersection
        return rectIntersection(args);
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
                {isAdmin ? (
                    <AddColumnButton onAdd={handleAddColumn} />
                ) : (
                    <p className="text-sm italic">Only an administrator can set up the board.</p>
                )}
            </div>
        );
    }
    
    return (
        <DndContext
            sensors={sensors}
            collisionDetection={collisionDetectionStrategy}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="w-full overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-[900px]">
                    {board?.columns?.map((col: any) => (
                        <BoardColumn
                            key={col.id}
                            id={col.status_key}
                            title={col.name}
                            statusKey={col.status_key}
                            tickets={tickets?.filter((t: any) => t.status === col.status_key) || []}
                            onCreateTicket={handleCreateClick}
                            onTicketClick={(ticket) => setViewingTicketId(ticket.id)}
                        />
                    ))}
                    {isAdmin && <AddColumnButton onAdd={handleAddColumn} />}
                </div>
            </div>

            <TicketDialog
                open={!!viewingTicketId}
                onOpenChange={(open) => !open && setViewingTicketId(null)}
                ticket={viewingTicket}
                board={board}
                members={members || []}
            />

            <DragOverlay dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                    styles: { active: { opacity: '0.4' } },
                }),
            }}>
                {activeTicket ? (
                    <div className="rotate-3 scale-105 transition-transform">
                        <TicketCard ticket={activeTicket} />
                    </div>
                ) : null}
            </DragOverlay>

            <CreateTicketDrawer
                open={isDrawerOpen}
                setOpen={setIsDrawerOpen}
                defaultStatus={activeStatus}
                onTodoCreated={() => queryClient.invalidateQueries({ queryKey: ['tickets', currentWorkspace?.id] })}
            />
        </DndContext>
    );
};