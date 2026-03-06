export interface Workspace {
    id: string;
    name: string;
    role: 'admin' | 'member' | 'viewer';
    user_id: string;
}