import { LayoutDashboard, LogOut, Settings, Users } from "lucide-react";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useAuth } from "@/context/AuthContext.tsx";

export const Sidebar = () => {
    const { logout } = useAuth();

    return (
        <aside className="hidden w-64 border-r bg-white md:block">
            <div className="flex h-full flex-col gap-4">
                <div className="flex items-center gap-2 font-bold px-6 py-6 text-xl">
                    <div className="bg-primary text-white p-1 rounded">
                        <LayoutDashboard className="h-5 w-5" />
                    </div>
                    <span>Ticket Manager</span>
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
    )
}