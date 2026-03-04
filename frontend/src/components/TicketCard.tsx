import { Card, CardContent } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

export const TicketCard = ({ ticket, isDraggable = true }: { ticket: any, isDraggable?: boolean }) => {

    const priorityColor = {
        urgent: "bg-red-100 text-red-700 border-red-200",
        high: "bg-orange-100 text-orange-700 border-orange-200",
        medium: "bg-blue-100 text-blue-700 border-blue-200",
        low: "bg-slate-100 text-slate-700 border-slate-200",
    }[ticket.priority as string] || "bg-slate-100";


    return (
        <Card
            className={`shadow-sm border-slate-200 hover:border-primary/40 transition-shadow ${
                isDraggable ? "cursor-grab active:cursor-grabbing" : "cursor-default"
            }`}
        >
            <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start gap-2">
                    {!isDraggable && <Lock className="h-3 w-3 text-slate-400" />}
                    <h4 className="text-sm font-semibold">{ticket.title}</h4>
                    <Badge className={priorityColor}>{ticket.priority}</Badge>
                </div>
            </CardContent>
        </Card>
    );
};