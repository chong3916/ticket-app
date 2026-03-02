import { LayoutDashboard, LogOut, Settings, Users } from "lucide-react";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useAuth } from "@/context/AuthContext.tsx";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/context/WorkspaceContext.tsx";

export const Sidebar = () => {
    const { logout } = useAuth();
    const { currentWorkspace } = useWorkspace();

    const getPath = (tab: string) =>
        currentWorkspace ? `/workspaces/${currentWorkspace.id}/${tab}` : "/";

    const navItems = [
        { label: "Board", icon: LayoutDashboard, path: getPath("board") },
        { label: "Members", icon: Users, path: getPath("members") },
        { label: "Settings", icon: Settings, path: getPath("settings") },
    ];

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
                    {navItems.map((item) => (
                        <NavLink
                            key={item.label}
                            to={item.path}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-secondary text-secondary-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )
                            }
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </NavLink>
                    ))}
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