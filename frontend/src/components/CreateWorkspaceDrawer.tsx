import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { toast } from "sonner";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts"
import { useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/context/WorkspaceContext.tsx";
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
import { PlusCircle } from "lucide-react";

const CreateWorkspaceForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const [name, setName] = useState('');
    const { secureFetch } = useApi();
    const { setWorkspace } = useWorkspace();
    const queryClient = useQueryClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await secureFetch('/api/workspaces', {
            method: 'POST',
            body: JSON.stringify({ name }),
        });

        if (res.ok) {
            const newWorkspace = await res.json();

            // Refresh the switcher list
            await queryClient.invalidateQueries({ queryKey: ['user-workspaces'] });

            setWorkspace(newWorkspace);

            toast.success(`Workspace "${name}" created!`);
            setName('');
            onSuccess();
        } else {
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const err = await res.json();
                toast.error(err.error || "Failed to create workspace");
            } else {
                toast.error("An unexpected error occurred");
            }
        }
    };

    return (
        <form onSubmit={ handleSubmit } className="px-4 pb-4 md:pb-0">
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="ws-name">Workspace Name</FieldLabel>
                    <Input
                        id="ws-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Engineering Team"
                        required
                        minLength={3}
                    />
                </Field>
                <Button type="submit" className="w-full">
                    Create Workspace
                </Button>
            </FieldGroup>
        </form>
    )
}

export const CreateWorkspaceDrawer = () => {
    const isDesktop = useMediaQuery("(min-width: 768px)")
    const [open, setOpen] = useState(false)

    const handleSuccess = () => setOpen(false);

    const trigger = (
        <Button variant="ghost" className="w-full justify-start gap-2 text-xs text-muted-foreground hover:text-primary px-2">
            <PlusCircle className="h-4 w-4"/> New Workspace
        </Button>
    )

    if (isDesktop) {
        return (
            <Dialog open={ open } onOpenChange={ setOpen }>
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create Workspace</DialogTitle>
                    </DialogHeader>
                    <CreateWorkspaceForm onSuccess={handleSuccess}/>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={ open } onOpenChange={ setOpen }>
            <DrawerTrigger asChild>
                {trigger}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>Create Workspace</DrawerTitle>
                </DrawerHeader>
                <CreateWorkspaceForm onSuccess={handleSuccess} />
                <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};