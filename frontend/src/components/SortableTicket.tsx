import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Ticket } from "@/types/ticket.ts";
import { TicketCard } from "@/components/TicketCard.tsx";

export const SortableTicket = ({ ticket, assignee, isDraggable, onClick }: { ticket: Ticket, assignee: any, isDraggable: boolean, onClick: () => void }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: ticket.id, disabled: !isDraggable });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
        opacity: isDragging ? 0.4 : 1,
        cursor: isDraggable ? 'grab' : 'default'
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick}>
            <TicketCard ticket={ticket} assignee={assignee} isDraggable={isDraggable} />
        </div>
    );
};