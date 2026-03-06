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
import { arrayMove, horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";

export const TicketBoard = () => {
    const { currentWorkspace } = useWorkspace();
    const isAdmin = currentWorkspace?.role === 'admin';
    const canEdit = currentWorkspace?.role === 'admin' || currentWorkspace?.role === 'member';

    const { data: board, isLoading: boardLoading } = useWorkspaceBoard();
    const { data: tickets, isLoading: ticketsLoading } = useWorkspaceTickets();
    const { data: members } = useWorkspaceMembers();

    const { secureFetch } = useApi();
    const queryClient = useQueryClient();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activeStatus, setActiveStatus] = useState<string | undefined>();
    const [activeTicket, setActiveTicket] = useState<any | null>(null);
    const [activeColumn, setActiveColumn] = useState<any | null>(null);

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
        if (!canEdit) return;
        const { active } = event;

        if (active.data.current?.type === 'Column') {
            const col = board.columns.find((c: any) => c.id === active.id);
            setActiveColumn(col);
            return;
        }

        const ticket = tickets?.find((t: any) => t.id === active.id);
        setActiveTicket(ticket);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTicket(null);
        setActiveColumn(null);

        if (!over || !canEdit) return;

        if (active.data.current?.type === 'Column') {
            const activeColumnId = active.id;
            const overColumnId = over.id;

            const oldIndex = board.columns.findIndex((col: any) => col.id === activeColumnId);
            let newIndex = board.columns.findIndex((col: any) => col.id === overColumnId);

            if (newIndex === -1) {
                const overTicket = tickets?.find((t: any) => t.id === overColumnId);
                if (overTicket) {
                    newIndex = board.columns.findIndex((col: any) => col.status_key === overTicket.status);
                }
            }

            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                const newOrder = arrayMove(board.columns, oldIndex, newIndex);

                queryClient.setQueryData(['board', currentWorkspace.id], { ...board, columns: newOrder });

                try {
                    await secureFetch(`/api/workspaces/${currentWorkspace.id}/board/columns`, {
                        method: 'PATCH',
                        body: JSON.stringify({ ordered_ids: newOrder.map((c: any) => c.id) })
                    });
                    toast.success("Board reordered");
                } catch (err) {
                    queryClient.invalidateQueries({ queryKey: ['board', currentWorkspace.id] });
                    toast.error("Failed to save board order");
                }
            }
            return;
        }

        const ticketId = active.id as string;
        let newStatus = over.id as string;

        const overTicket = tickets?.find((t: any) => t.id === over.id);
        if (overTicket) {
            newStatus = overTicket.status;
        } else {
            const overColumn = board.columns.find((col: any) => col.id === over.id);
            if (overColumn) {
                newStatus = overColumn.status_key;
            }
        }

        const queryKey = ['tickets', currentWorkspace?.id];

        const currentTickets = queryClient.getQueryData<any[]>(queryKey);
        const draggedTicket = tickets?.find((t: any) => t.id === ticketId);

        if (!draggedTicket || draggedTicket.status === newStatus) return;

        queryClient.setQueryData(queryKey, (old: any[] | undefined) => {
            if (!old) return [];
            return old.map(t => t.id === ticketId ? { ...t, status: newStatus } : t);
        });

        try {
            const res = await secureFetch(`/api/workspaces/${currentWorkspace?.id}/tickets/${ticketId}`, {
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
        if (activeTicket === null && args.active.data.current?.type === 'Column') {
            return rectIntersection(args);
        }

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

    const handleRemoveColumn = async (statusKey: string) => {
        const boardKey = ['board', currentWorkspace?.id];
        const ticketKey = ['tickets', currentWorkspace?.id];

        const previousBoard = queryClient.getQueryData(boardKey);
        const previousTickets = queryClient.getQueryData(ticketKey);

        queryClient.setQueryData(boardKey, (old: any) => ({
            ...old,
            columns: old.columns.filter((col: any) => col.status_key !== statusKey)
        }));

        queryClient.setQueryData(ticketKey, (old: any[] | undefined) =>
            old?.filter(t => t.status !== statusKey)
        );

        try {
            const res = await secureFetch(`/api/workspaces/${currentWorkspace?.id}/board/columns/${statusKey}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error("Failed to delete column");
            toast.success("Column removed");
        } catch (err) {
            queryClient.setQueryData(boardKey, previousBoard);
            queryClient.setQueryData(ticketKey, previousTickets);
            toast.error("Could not remove column");
        }
    };

    const handleRenameColumn = async (columnId: string, newName: string) => {
        const boardKey = ['board', currentWorkspace?.id];
        const previousBoard = queryClient.getQueryData(boardKey);

        queryClient.setQueryData(boardKey, (old: any) => ({
            ...old,
            columns: old.columns.map((col: any) =>
                col.id === columnId ? { ...col, name: newName } : col
            )
        }));

        try {
            const res = await secureFetch(`/api/workspaces/${currentWorkspace?.id}/board/columns/${columnId}`, {
                method: 'PATCH',
                body: JSON.stringify({ name: newName }),
            });

            if (!res.ok) throw new Error();
            toast.success("Column renamed");
        } catch (err) {
            queryClient.setQueryData(boardKey, previousBoard);
            toast.error("Failed to rename column");
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
            <div className="w-full overflow-x-auto pb-6 custom-scrollbar">
                <div className="flex gap-4 items-start p-2 min-h-[calc(100vh-200px)]">
                    <SortableContext
                        items={board.columns.map((col: any) => col.id)}
                        strategy={horizontalListSortingStrategy}
                    >
                        {board?.columns?.map((col: any) => (
                            <BoardColumn
                                key={col.id}
                                id={col.status_key}
                                columnId={col.id}
                                title={col.name}
                                statusKey={col.status_key}
                                tickets={tickets?.filter((t: any) => t.status === col.status_key) || []}
                                members={members}
                                canCreate={canEdit}
                                isAdmin={isAdmin}
                                onCreateTicket={handleCreateClick}
                                onTicketClick={(ticket) => setViewingTicketId(ticket.id)}
                                onRemoveColumn={handleRemoveColumn}
                                onRenameColumn={handleRenameColumn}
                            />
                        ))}
                    </SortableContext>
                    {isAdmin && (
                        <div className="shrink-0">
                            <AddColumnButton onAdd={handleAddColumn} />
                        </div>
                    )}
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
                        <TicketCard ticket={activeTicket}
                                    assignee={members?.find((m: any) => m.id === activeTicket.assignee_id)} />
                    </div>
                ) : null}

                {activeColumn && (
                    <div className="rotate-2 scale-[1.02] opacity-90 shadow-2xl transition-transform">
                        <BoardColumn
                            id={activeColumn.status_key}
                            columnId={activeColumn.id}
                            title={activeColumn.name}
                            statusKey={activeColumn.status_key}
                            tickets={tickets?.filter((t: any) => t.status === activeColumn.status_key) || []}
                            members={members}
                            canCreate={false}
                            isAdmin={false}
                            onCreateTicket={() => {}}
                            onTicketClick={() => {}}
                            onRemoveColumn={() => {}}
                            onRenameColumn={() => {}}
                        />
                    </div>
                )}
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