import { TicketBoard } from "@/components/TicketBoard.tsx";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Sidebar } from "@/components/Sidebar.tsx";

export const DashboardPage = () => {
    const { currentWorkspace } = useWorkspace();

    return (
        <div className="flex min-h-screen w-full bg-slate-50/50">
            <Sidebar />

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
                <header className="flex h-16 items-center justify-between border-b bg-white px-8">
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Workspaces</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="font-semibold">{currentWorkspace?.name || "Select Workspace"}</span>
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