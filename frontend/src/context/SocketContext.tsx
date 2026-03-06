import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { useWorkspace } from './WorkspaceContext';
import { useQueryClient } from '@tanstack/react-query';
import { type WSEvent, WSEventType } from "@/types/websocket.ts";

interface SocketContextType {
    socket: WebSocket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

const getWebsocketUrl = (token: string, workspaceId: string) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/api/ws?token=${token}&workspaceId=${workspaceId}`;
}

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token, user } = useAuth();
    const { currentWorkspace } = useWorkspace();
    const queryClient = useQueryClient();
    const socketRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Only connect if token exists & workspace selected
        if (token && currentWorkspace?.id) {
            const wsUrl = getWebsocketUrl(token, currentWorkspace?.id);
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('Connected to Workspace Real-time Sync');
                setIsConnected(true);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    handleSocketEvent(data);
                } catch (err) {
                    console.error("Failed to parse WS message:", err);
                }
            };

            ws.onclose = () => {
                console.log('Disconnected from Sync');
                setIsConnected(false);
            };

            socketRef.current = ws;

            return () => {
                ws.close();
            };
        }
    }, [token, currentWorkspace?.id]);

    const handleSocketEvent = useCallback((event: WSEvent) => {
        const { type, payload, workspaceId: eventWsId } = event;

        switch (type) {
            case WSEventType.TicketCreated:
                queryClient.setQueryData(['tickets', eventWsId], (oldTickets: any[] | undefined) => {
                    if (!oldTickets) return [payload];
                    if (oldTickets.find(t => t.id === payload.id)) return oldTickets;
                    return [...oldTickets, payload];
                });
                break;
            case WSEventType.TicketUpdated:
                queryClient.setQueryData(['tickets', eventWsId], (oldTickets: any[]) => {
                    if (!oldTickets) return undefined;

                    const updatedTicket = payload;

                    return oldTickets.map(t => t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t);
                });
                break;
            case WSEventType.TicketDeleted:
                // Immediately remove from UI
                queryClient.setQueryData(['tickets', eventWsId], (oldTickets: any[]) => {
                    return oldTickets.filter(t => t.id !== payload.ticket_id);
                });
                break;
            case WSEventType.BoardColumnAdded:
                queryClient.setQueryData(['board', eventWsId], (oldBoard: any) => {
                    if (!oldBoard) return oldBoard;
                    return {
                        ...oldBoard,
                        columns: [...oldBoard.columns, payload]
                    };
                });
                break;
            default:
                // Fallback
                queryClient.invalidateQueries({ queryKey: ['tickets', eventWsId] });
        }
    }, [queryClient, user?.id]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};