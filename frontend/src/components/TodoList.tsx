import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { toast } from "sonner";
import { TaskCard } from "@/components/TaskCard.tsx";
import type { Todo } from "@/types/todo.ts";

export const TodoList = () => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const { secureFetch } = useApi();

    const fetchTodos = async () => {
        try {
            const res = await secureFetch("/api/todos");
            if (res.ok) {
                const data = await res.json();
                setTodos(data || []);
            }
        } catch (error) {
            toast.error("Could not load tasks");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    const handleToggleStatus = async (id: string, isCurrentlyCompleted: boolean) => {
        const newStatus = isCurrentlyCompleted ? "pending" : "completed";
        const oldStatus = isCurrentlyCompleted ? "completed" : "pending";

        setTodos(prev => prev.map(t =>
            t.id === id ? { ...t, status: newStatus } : t
        ));

        const res = await secureFetch(`/api/todos/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus }),
        });

        if (!res.ok) {
            toast.error("Failed to update task");
            // Rollback if the server fails
            setTodos(prev => prev.map(t =>
                t.id === id ? { ...t, status: oldStatus } : t
            ));
        }
    };

    if (loading) {
        return <div className="text-center py-4 text-muted-foreground italic">Loading tasks...</div>;
    }

    if (todos.length === 0) {
        return (
            <div className="flex h-[150px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                No tasks yet. Click "New Task" to get started!
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {todos.map((todo) => (
                <TaskCard
                    key={todo.id}
                    task={todo}
                    onToggle={() => handleToggleStatus(todo.id, todo.status === "completed")}
                />
            ))}
        </div>
    );
};