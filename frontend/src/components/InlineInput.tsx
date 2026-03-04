import { useState } from "react";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";

export const InlineInput = ({ value, onSave, className, disabled = false }: { value: string, onSave: (v: string) => void, className?: string, disabled?: boolean }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [current, setCurrent] = useState(value);

    const handleDoubleClick = () => {
        if (!disabled) setIsEditing(true);
    };

    if (isEditing && !disabled) {
        return (
            <Input
                autoFocus
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                onBlur={() => { setIsEditing(false); onSave(current); }}
                onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget.blur())}
                className={className}
                disabled={disabled}
            />
        );
    }
    return (
        <div onDoubleClick={handleDoubleClick}
             className={`rounded px-1 -ml-1 transition-colors ${
                 disabled ? "cursor-default" : "cursor-text hover:bg-slate-50"
             } ${className}`}
        >
            {value}
        </div>
    );
};

export const InlineTextarea = ({ value, onSave, disabled = false }: { value: string, onSave: (v: string) => void, disabled?: boolean }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [current, setCurrent] = useState(value);

    const handleDoubleClick = () => {
        if (!disabled) setIsEditing(true);
    };

    if (isEditing && !disabled) {
        return (
            <Textarea
                autoFocus
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                onBlur={() => { setIsEditing(false); onSave(current); }}
                className="text-sm min-h-[100px]"
                disabled={disabled}
            />
        );
    }
    return (
        <div onDoubleClick={handleDoubleClick}
             className={`text-sm p-3 rounded-md border transition-all ${
                 disabled
                     ? "text-slate-500 bg-slate-100/50 cursor-default"
                     : "text-slate-600 bg-slate-50 cursor-text hover:border-primary/30"
             }`}
        >
            {value || "Double-click to add a description..."}
        </div>
    );
};