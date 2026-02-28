import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const TicketCard = ({ ticket, onMove }: { ticket: any, onMove: (s: string) => void }) => {
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

                <div className="flex justify-end pt-2">
                    {ticket.status === 'todo' && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => onMove('in_progress')}>
                            Start <ArrowRight className="h-3 w-3" />
                        </Button>
                    )}
                    {ticket.status === 'in_progress' && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-green-600 hover:text-green-700" onClick={() => onMove('done')}>
                            Finish <CheckCircle2 className="h-3 w-3" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};