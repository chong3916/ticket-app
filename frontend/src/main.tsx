import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from "./context/AuthContext.tsx";
import { BrowserRouter } from "react-router-dom";
import { WorkspaceProvider } from "@/context/WorkspaceProvider.tsx";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SocketProvider } from "@/context/SocketContext.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
})

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
if (!googleClientId) {
    console.warn("Missing VITE_GOOGLE_CLIENT_ID environment variable");
}

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <GoogleOAuthProvider clientId={googleClientId || ""}>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <WorkspaceProvider>
                        <SocketProvider>
                            <App/>
                        </SocketProvider>
                    </WorkspaceProvider>
                </AuthProvider>
            </QueryClientProvider>
        </GoogleOAuthProvider>
    </BrowserRouter>,
)
