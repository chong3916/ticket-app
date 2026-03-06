import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from "./context/AuthContext.tsx";
import { BrowserRouter } from "react-router-dom";
import { WorkspaceProvider } from "@/context/WorkspaceProvider.tsx";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SocketProvider } from "@/context/SocketContext.tsx";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
})

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <WorkspaceProvider>
                    <SocketProvider>
                        <App/>
                    </SocketProvider>
                </WorkspaceProvider>
            </AuthProvider>
        </QueryClientProvider>
    </BrowserRouter>,
)
