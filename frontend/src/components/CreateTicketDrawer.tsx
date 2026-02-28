import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { toast } from "sonner";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Plus } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext.tsx";

const CreateTicketForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const { secureFetch } = useApi();
    const { currentWorkspace } = useWorkspace();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentWorkspace?.id) {
            toast.error("Please select a workspace first");
            return;
        }

        const payload = {
            workspace_id_str: currentWorkspace.id,
            title: title,
            description: description,
            priority: "medium",
            tags: []
        };

        const res = await secureFetch('/api/tickets', {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            toast.success("Ticket created in " + currentWorkspace.name);
            setTitle('');
            setDescription('');
            onSuccess();
        } else {
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const err = await res.json();
                toast.error(err.error || "Failed to create ticket");
            } else {
                toast.error("An unexpected error occurred");
            }
        }
    };

    return (
        <form onSubmit={ handleSubmit }>
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="title">Title</FieldLabel>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ticket title..."
                        required
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="desc">Description</FieldLabel>
                    <Input
                        id="desc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add more details..."
                    />
                </Field>
                <Button type="submit" className="w-full" disabled={!currentWorkspace}>
                    {currentWorkspace ? `Create Ticket` : "Select a Workspace"}
                </Button>
            </FieldGroup>
        </form>
    )
}

export const CreateTicketDrawer = ({ onTodoCreated }: { onTodoCreated: () => void }) => {
    const isDesktop = useMediaQuery("(min-width: 768px)")
    const [open, setOpen] = useState(false)

    const handleSuccess = () => setOpen(false);

    if (isDesktop) {
        return (
            <Dialog open={ open } onOpenChange={ setOpen }>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <Plus className="h-4 w-4"/>New Task
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>New Todo Task</DialogTitle>
                    </DialogHeader>
                    <CreateTicketForm onSuccess={() => {
                        handleSuccess();
                        onTodoCreated();
                    }}/>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={ open } onOpenChange={ setOpen }>
            <DrawerTrigger asChild>
                <Button variant="outline">
                    <Plus className="h-4 w-4"/>New Task
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>New Todo Task</DrawerTitle>
                </DrawerHeader>
                <CreateTicketForm onSuccess={() => {
                    handleSuccess();
                    onTodoCreated();
                }} />
                <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};