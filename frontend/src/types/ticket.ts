export interface Ticket {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    creator_id: string;
    assignee_id: string;
    created_at?: string;
    updated_at?: string;
}