import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { Todo } from "@/types/todo.ts";
import { cn } from "@/lib/utils";

interface TaskCardProps {
    task: Todo;
    onToggle?: (id: string, completed: boolean) => void;
}

export const TaskCard = ({ task, onToggle }: TaskCardProps) => {
    return (
        <Card className="transition-all hover:shadow-md">
            <CardContent className="flex items-center p-4 gap-4">
                <Checkbox
                    id={`todo-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={(checked) => onToggle?.(task.id, checked as boolean)}
                />

                <div className="flex flex-1 flex-col text-left">
                    <label
                        htmlFor={`todo-${task.id}`}
                        className={cn(
                            "text-sm font-medium leading-none cursor-pointer",
                            task.completed && "line-through text-muted-foreground"
                        )}
                    >
                        {task.title}
                    </label>

                    {/*{task.description && (*/}
                    {/*    <p className="text-xs text-muted-foreground mt-1">{task.description}</p>*/}
                    {/*)}*/}
                </div>

                {task.completed ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                        Done
                    </Badge>
                ) : (
                    <Badge variant="outline">Pending</Badge>
                )}
            </CardContent>
        </Card>
    );
};