import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Settings, Users } from "lucide-react";
import { CreateTicketDrawer } from "@/components/CreateTicketDrawer.tsx";
import { TicketBoard } from "@/components/TicketBoard.tsx";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher.tsx";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useQueryClient } from "@tanstack/react-query";

export default function DashboardPage() {
    const { logout } = useAuth();
    const { currentWorkspace } = useWorkspace();
    const queryClient = useQueryClient();

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['tickets', currentWorkspace?.id] });
    };

    return (
        <div className="flex min-h-screen w-full bg-slate-50/50">
            {/* Sidebar */}
            <aside className="hidden w-64 border-r bg-white md:block">
                <div className="flex h-full flex-col gap-4">
                    <div className="flex items-center gap-2 font-bold px-6 py-6 text-xl">
                        <div className="bg-primary text-white p-1 rounded">
                            <LayoutDashboard className="h-5 w-5" />
                        </div>
                        <span>TaskMaster</span>
                    </div>

                    <WorkspaceSwitcher />

                    <nav className="grid gap-1 px-4">
                        <Button variant="secondary" className="justify-start gap-3">
                            <LayoutDashboard className="h-4 w-4" />
                            Board
                        </Button>
                        <Button variant="ghost" className="justify-start gap-3 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            Members
                        </Button>
                        <Button variant="ghost" className="justify-start gap-3 text-muted-foreground">
                            <Settings className="h-4 w-4" />
                            Settings
                        </Button>
                    </nav>

                    <div className="mt-auto p-4 border-t">
                        <Button variant="ghost" onClick={logout} className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10">
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
                <header className="flex h-16 items-center justify-between border-b bg-white px-8">
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Workspaces</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="font-semibold">{currentWorkspace?.name || "Select Workspace"}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <CreateTicketDrawer onTodoCreated={handleRefresh} />
                    </div>
                </header>

                <main className="flex-1 p-8">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold tracking-tight">
                            {currentWorkspace ? `${currentWorkspace.name} Board` : "Welcome back!"}
                        </h2>
                        <p className="text-muted-foreground">
                            Manage and track your team's progress here.
                        </p>
                    </div>

                    <TicketBoard />
                </main>
            </div>
        </div>
    );
}