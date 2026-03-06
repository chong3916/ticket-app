import LoginPage from "@/containers/LoginPage.tsx";
import { Toaster } from "@/components/ui/sonner"
import { Routes, Route, Navigate } from "react-router-dom";
import SignupPage from "@/containers/SignupPage.tsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.tsx";
import { WorkspaceLayout } from "@/components/WorkspaceLayout.tsx";
import { TicketBoard } from "@/components/TicketBoard.tsx";
import { MembersPage } from "@/containers/MembersPage.tsx";
import { WorkspacesPage } from "@/containers/WorkspacesPage.tsx";
import { WorkspaceSettingsPage } from "@/containers/WorkspaceSettingsPage.tsx";
import { useAuth } from "@/context/AuthContext.tsx";

const DashboardRedirect = () => {
    return <Navigate to="/workspaces" replace />;
};

function App() {
    const { isLoading } = useAuth();

    if (isLoading) {
        return <div className="h-screen w-screen flex items-center justify-center">Loading session...</div>;
    }

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
                        <Route path="/workspaces" element={<WorkspacesPage />} />
                    </Route>

                    <Route path="/workspaces/:id" element={<WorkspaceLayout />}>
                        <Route index element={<Navigate to="board" replace />} />
                        <Route path="board" element={<TicketBoard />} />
                        <Route path="members" element={<MembersPage />} />
                        <Route path="settings" element={<WorkspaceSettingsPage />} />
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
