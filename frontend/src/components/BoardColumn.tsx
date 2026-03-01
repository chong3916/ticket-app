import { TicketCard } from "./TicketCard";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BoardColumnProps {
    title: string;
    statusKey: string;
    tickets: any[];
    onCreateTicket: (status: string) => void;
}

export const BoardColumn = ({ title, statusKey, tickets, onCreateTicket }: BoardColumnProps) => {
    return (
        <div className="flex flex-col bg-slate-100/50 rounded-lg p-4 w-full min-h-[600px] border border-slate-200">
            {/* Column Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-700 text-sm uppercase tracking-tight">{title}</h3>
                    <span className="bg-white px-2 py-0.5 rounded-md text-xs font-semibold text-slate-500 border">
                        {tickets.length}
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-indigo-600"
                    onClick={() => onCreateTicket(statusKey)}
                >
                    <PlusIcon className="h-4 w-4" />
                </Button>
            </div>

            {/* Ticket List */}
            <div className="space-y-4 flex-1">
                {tickets.length > 0 ? (
                    tickets.map((ticket) => (
                        <TicketCard
                            key={ticket.id}
                            ticket={ticket}
                        />
                    ))
                ) : (
                    <div className="h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs italic">
                        No tickets in {title}
                    </div>
                )}
            </div>
        </div>
    );
};