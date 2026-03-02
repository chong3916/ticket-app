import { useState } from "react";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";

export const InlineInput = ({ value, onSave, className }: { value: string, onSave: (v: string) => void, className?: string }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [current, setCurrent] = useState(value);

    if (isEditing) {
        return (
            <Input
                autoFocus
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                onBlur={() => { setIsEditing(false); onSave(current); }}
                onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget.blur())}
                className={className}
            />
        );
    }
    return (
        <div onDoubleClick={() => setIsEditing(true)} className={`cursor-text hover:bg-slate-50 rounded px-1 -ml-1 transition-colors ${className}`}>
            {value}
        </div>
    );
};

export const InlineTextarea = ({ value, onSave }: { value: string, onSave: (v: string) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [current, setCurrent] = useState(value);

    if (isEditing) {
        return (
            <Textarea
                autoFocus
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                onBlur={() => { setIsEditing(false); onSave(current); }}
                className="text-sm min-h-[100px]"
            />
        );
    }
    return (
        <div
            onDoubleClick={() => setIsEditing(true)}
            className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md border italic cursor-text hover:border-primary/30 transition-all"
        >
            {value || "Double-click to add a description..."}
        </div>
    );
};