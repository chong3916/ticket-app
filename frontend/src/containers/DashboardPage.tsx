import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LogOut, ListTodo } from "lucide-react";
import { useState } from "react";
import { CreateTodoDrawer } from "@/components/CreateTodoDrawer.tsx";
import { TodoList } from "@/components/TodoList.tsx";

export default function DashboardPage() {
    const { logout } = useAuth();
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = () => setRefreshKey(prev => prev + 1);

    return (
        <div className="flex min-h-screen w-full bg-muted/40">
            <aside className="hidden w-64 border-r bg-background md:block">
                <div className="flex h-full flex-col gap-2 p-4">
                    <div className="flex items-center gap-2 font-semibold px-2 py-4">
                        <ListTodo className="h-6 w-6 text-primary" />
                        <span>TaskMaster v4</span>
                    </div>
                    <nav className="grid gap-1">
                        <Button variant="ghost" className="justify-start gap-2">
                            Dashboard
                        </Button>
                    </nav>
                </div>
            </aside>

            <div className="flex flex-1 flex-col">
                {/* Top Header */}
                <header className="flex h-14 items-center justify-between border-b bg-background px-6">
                    <h1 className="text-lg font-semibold">My Tasks</h1>
                    <Button variant="outline" size="sm" onClick={logout} className="gap-2">
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-6 text-left">
                    <div className="mx-auto max-w-4xl space-y-6 text-left">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
                                <p className="text-muted-foreground">
                                    Here&apos;s what is happening with your projects today.
                                </p>
                            </div>
                            <CreateTodoDrawer onTodoCreated={handleRefresh} />
                        </div>

                        {/* Placeholder for Todo List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Upcoming Tasks</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <TodoList key={refreshKey} />
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}