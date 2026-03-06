import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableTicket } from "@/components/SortableTicket.tsx";
import type { Ticket } from "@/types/ticket.ts";
import { DeleteColumnDialog } from "@/components/DeleteColumnDialog.tsx";

interface BoardColumnProps {
    id: string;
    title: string;
    statusKey: string;
    tickets: Ticket[];
    canCreate: boolean;
    isAdmin: boolean;
    onCreateTicket: (status: string) => void;
    onTicketClick: (ticket: Ticket) => void;
    onRemoveColumn: (statusKey: string) => void;
}

export const BoardColumn = ({ id, title, statusKey, tickets, canCreate, isAdmin, onCreateTicket, onTicketClick, onRemoveColumn }: BoardColumnProps) => {
    const { setNodeRef, isOver } = useDroppable({ id, disabled: !canCreate });

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col rounded-lg p-4 w-full min-h-[600px] border transition-colors ${
                isOver && canCreate ? "bg-indigo-50 border-indigo-200 shadow-inner" : "bg-slate-100/50 border-slate-200"
            }`}
        >
            {/* Column Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-700 text-sm uppercase tracking-tight">{title}</h3>
                    <span className="bg-white px-2 py-0.5 rounded-md text-xs font-semibold text-slate-500 border">
                        {tickets.length}
                    </span>
                </div>
                {canCreate && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-indigo-600"
                        onClick={() => onCreateTicket(statusKey)}
                    >
                        <PlusIcon className="h-4 w-4" />
                    </Button>
                )}
                {isAdmin && (
                    <DeleteColumnDialog
                        title="Delete Column?"
                        description="All tickets in this column will be permanently removed."
                        onConfirm={() => onRemoveColumn(statusKey)}
                    />
                )}
            </div>

            {/* Ticket List */}
            <SortableContext id={id} items={tickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4 flex-1">
                    {tickets.length > 0 ? (
                        tickets.map((ticket: Ticket) => (
                            <SortableTicket key={ticket.id} ticket={ticket} isDraggable={canCreate} onClick={() => onTicketClick(ticket)} />
                        ))
                    ) : (
                        <div className="h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs italic">
                            No tickets in {title}
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
};