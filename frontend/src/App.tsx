import './App.css'
import { CreateTodo } from "./components/CreateTodo.tsx";
import { AuthForm } from "./components/AuthForm.tsx";
import { useAuth } from "./context/AuthContext.tsx";

function App() {
    const { isAuthenticated, logout } = useAuth();

    if (!isAuthenticated) {
        return <AuthForm />;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">My Tasks</h1>
                    <button
                        onClick={logout}
                        className="text-sm bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                        Logout
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <CreateTodo />
                </div>
            </div>
        </div>
    );
}

export default App
