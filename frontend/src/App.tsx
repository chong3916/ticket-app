import LoginPage from "@/containers/LoginPage.tsx";
import { Toaster } from "@/components/ui/sonner"
import { Routes, Route, Navigate } from "react-router-dom";
import SignupPage from "@/containers/SignupPage.tsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.tsx";
import DashboardPage from "@/containers/DashboardPage.tsx";

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
                    <Route path="/dashboard" element={<DashboardPage />} />
                </Route>

                {/* Default Redirects */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
        </>
    );
}

export default App
