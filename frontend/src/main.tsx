import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from "./context/AuthContext.tsx";
import { BrowserRouter } from "react-router-dom";
import { WorkspaceProvider } from "@/context/WorkspaceContext.tsx";

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <AuthProvider>
            <WorkspaceProvider>
                <App/>
            </WorkspaceProvider>
        </AuthProvider>
    </BrowserRouter>,
)
