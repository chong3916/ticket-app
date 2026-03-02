import LoginPage from "@/containers/LoginPage.tsx";
import { Toaster } from "@/components/ui/sonner"
import { Routes, Route, Navigate } from "react-router-dom";
import SignupPage from "@/containers/SignupPage.tsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.tsx";
import { WorkspaceLayout } from "@/components/WorkspaceLayout.tsx";
import { TicketBoard } from "@/components/TicketBoard.tsx";
import { useWorkspace } from "@/context/WorkspaceContext.tsx";
import { MembersPage } from "@/containers/MembersPage.tsx";
import { EmptyState } from "@/components/EmptyState.tsx";

const DashboardRedirect = () => {
    const { currentWorkspace, workspaces, isLoading } = useWorkspace();

    if (isLoading) return null;

    if (currentWorkspace) {
        return <Navigate to={`/workspaces/${currentWorkspace.id}/board`} replace />;
    }

    if (workspaces.length > 0) {
        return <Navigate to={`/workspaces/${workspaces[0].id}/board`} replace />;
    }

    return <Navigate to="/welcome" replace />;
};

function App() {
    return (
        <>
            <Toaster position="top-center" richColors />
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* Private Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<WorkspaceLayout />}>
                        <Route path="/dashboard" element={<DashboardRedirect />} />
                        <Route path="/welcome" element={<EmptyState />} />
                    </Route>

                    <Route path="/workspaces/:id" element={<WorkspaceLayout />}>
                        <Route index element={<Navigate to="board" replace />} />
                        <Route path="board" element={<TicketBoard />} />
                        <Route path="members" element={<MembersPage />} />
                        {/*<Route path="settings" element={<SettingsPage />} />*/}
                    </Route>
                </Route>

                {/* Default Redirects */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
        </>
    );
}

export default App
