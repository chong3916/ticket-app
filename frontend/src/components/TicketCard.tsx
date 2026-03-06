import { Card, CardContent } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge";
import { Lock, User2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const TicketCard = ({ ticket, assignee, isDraggable = true }: { ticket: any, assignee?: any, isDraggable?: boolean }) => {
    console.log(assignee)
    const priorityColor = {
        urgent: "bg-red-100 text-red-700 border-red-200",
        high: "bg-orange-100 text-orange-700 border-orange-200",
        medium: "bg-blue-100 text-blue-700 border-blue-200",
        low: "bg-slate-100 text-slate-700 border-slate-200",
    }[ticket.priority as string] || "bg-slate-100";

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <Card
            className={`shadow-sm p-0 border-slate-200 hover:border-primary/40 transition-shadow ${
                isDraggable ? "cursor-grab active:cursor-grabbing" : "cursor-default"
            }`}
        >
            <CardContent className="p-5 pr-3 pb-4 flex justify-between gap-4 min-h-[120px]">
                <div className="flex flex-col justify-between flex-1">
                    <div className="flex items-start gap-1.5">
                        {!isDraggable && <Lock className="h-3 w-3 text-slate-400 mt-1 shrink-0" />}
                        <h4 className="text-sm font-semibold leading-snug break-words">
                            {ticket.title}
                        </h4>
                    </div>

                    <div className="h-7 flex items-center">
                        <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest leading-none">
                            #{ticket.id.substring(0, 4)}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-between shrink-0 min-w-[60px]">
                    {/* WRAPPER: Matches the height of the title area so the badge stays top-aligned */}
                    <div className="flex items-start pt-0.5">
                        <Badge variant="outline" className={`capitalize text-[9px] px-2 h-5 shrink-0 font-bold ${priorityColor}`}>
                            {ticket.priority}
                        </Badge>
                    </div>

                    <div className="h-7 flex items-center justify-center">
                        {assignee ? (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white border-2 border-white shadow-sm cursor-default">
                                            {getInitials(assignee.username || "??")}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-xs">{assignee.username}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <div className="h-7 w-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 border border-dashed border-slate-200">
                                <User2 className="h-3.5 w-3.5" />
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};