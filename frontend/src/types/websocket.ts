// @ts-ignore
export enum WSEventType {
    TicketCreated = 'TICKET_CREATED',
    TicketUpdated = 'TICKET_UPDATED',
    TicketDeleted = 'TICKET_DELETED',
    BoardColumnAdded = 'COLUMN_ADDED',
}

export interface WSEvent<T = any> {
    type: WSEventType | string;
    workspaceId: string;
    payload: T;
}

export interface TicketDeletedPayload {
    ticket_id: string;
}