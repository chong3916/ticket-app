import { PlusIcon, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableTicket } from "@/components/SortableTicket.tsx";
import type { Ticket } from "@/types/ticket.ts";
import { DeleteColumnDialog } from "@/components/DeleteColumnDialog.tsx";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

interface BoardColumnProps {
    id: string;
    columnId: string;
    title: string;
    statusKey: string;
    tickets: Ticket[];
    canCreate: boolean;
    isAdmin: boolean;
    onCreateTicket: (status: string) => void;
    onTicketClick: (ticket: Ticket) => void;
    onRemoveColumn: (statusKey: string) => void;
    onRenameColumn: (columnId: string, newName: string) => void;
}

export const BoardColumn = ({ id, columnId, title, statusKey, tickets, canCreate, isAdmin, onCreateTicket, onTicketClick, onRemoveColumn, onRenameColumn }: BoardColumnProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(title);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: columnId,
        data: {
            type: 'Column',
        },
        disabled: !isAdmin || isEditing
    });

    const handleBlur = () => {
        setIsEditing(false);
        if (editValue !== title && editValue.trim() !== "") {
            onRenameColumn(columnId, editValue);
        }
    };

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="flex flex-col rounded-lg p-4 w-full min-h-[600px] border-2 border-indigo-200 bg-indigo-50/50 opacity-50"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex flex-col rounded-lg p-4 w-full min-h-[600px] border bg-slate-100/50 border-slate-200`}
        >
            {/* Column Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    {isAdmin && !isEditing && (
                        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-400">
                            <GripVertical className="h-4 w-4" />
                        </div>
                    )}
                    {isEditing ? (
                        <input
                            autoFocus
                            className="text-sm font-bold uppercase bg-transparent border-b border-indigo-500 outline-none w-32"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
                        />
                    ) : (
                        <h3
                            className={`font-bold text-slate-700 text-sm uppercase tracking-tight ${isAdmin ? 'cursor-edit hover:text-indigo-600' : ''}`}
                            onClick={() => isAdmin && setIsEditing(true)}
                        >
                            {title}
                        </h3>
                    )}
                    <span className="bg-white px-2 py-0.5 rounded-md text-xs font-semibold text-slate-500 border">
                        {tickets.length}
                    </span>
                </div>
                <div className="flex items-center gap-1">
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