import { useSocket } from "@/context/SocketContext";

export const ConnectionStatus = () => {
    const { isConnected } = useSocket();

    return (
        <div className="flex items-center gap-2 text-sm font-medium">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className={isConnected ? "text-green-600" : "text-gray-500"}>
                {isConnected ? "Live Sync Active" : "Offline"}
            </span>
        </div>
    );
};