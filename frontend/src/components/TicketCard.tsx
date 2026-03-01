import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const TicketCard = ({ ticket }: { ticket: any }) => {
    return (
        <Card className="shadow-sm border-slate-200 hover:border-primary/30 transition-colors">
            <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start gap-2">
                    <h4 className="text-sm font-semibold text-slate-800 leading-tight">
                        {ticket.title}
                    </h4>
                    <Badge variant="outline" className="text-[9px] uppercase font-bold">
                        {ticket.priority}
                    </Badge>
                </div>
                {ticket.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">{ticket.description}</p>
                )}
            </CardContent>
        </Card>
    );
};