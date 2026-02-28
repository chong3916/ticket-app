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

const CreateTodoForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const [title, setTitle] = useState('');
    const { secureFetch } = useApi();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await secureFetch('/api/todos', {
            method: 'POST',
            body: JSON.stringify({ title }),
        });

        if (res.ok) {
            toast("Todo created!");
            setTitle('');
            onSuccess();
        }
    };

    return (
        <form onSubmit={ handleSubmit }>
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="title">Title</FieldLabel>
                    <Input
                        id="title"
                        type="text"
                        placeholder="e.g., Buy groceries"
                        value={ title }
                        onChange={ (e) => setTitle(e.target.value) }
                        required
                    />
                </Field>
                <Field>
                    <Button type="submit">Create Task</Button>
                </Field>
            </FieldGroup>
        </form>
    )
}

export const CreateTodoDrawer = ({ onTodoCreated }: { onTodoCreated: () => void }) => {
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
                    <CreateTodoForm onSuccess={() => {
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
                <CreateTodoForm onSuccess={() => {
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