import { useState } from "react";
import { Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const AddColumnButton = ({ onAdd }: { onAdd: (name: string) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState("");

    if (!isEditing) {
        return (
            <Button
                variant="ghost"
                className="h-[600px] min-w-[280px] border-2 bg-slate-50/50 hover:bg-slate-100"
                onClick={() => setIsEditing(true)}
            >
                <Plus className="mr-2 h-4 w-4" /> Add Column
            </Button>
        );
    }

    return (
        <div className="bg-white rounded-lg p-4 border shadow-sm min-w-[280px] h-fit">
            <Input
                autoFocus
                placeholder="Column name (e.g. QA)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onAdd(name)}
            />
            <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => { onAdd(name); setIsEditing(false); setName(""); }}>
                    <Check className="h-4 w-4 mr-1" /> Add
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};