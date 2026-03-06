import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button.tsx";
import { Trash2 } from "lucide-react";

interface DeleteColumnDialogProps {
    onConfirm: () => void;
    title: string;
    description: string;
}

export const DeleteColumnDialog = ({ onConfirm, title, description }: DeleteColumnDialogProps) => (
    <AlertDialog>
        <AlertDialogTrigger asChild>
            <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                onPointerDown={(e) => e.stopPropagation()}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{title}</AlertDialogTitle>
                <AlertDialogDescription>{description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    onClick={(e) => {
                        e.stopPropagation();
                        onConfirm();
                    }}
                    className="bg-red-600 hover:bg-red-700"
                >
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);