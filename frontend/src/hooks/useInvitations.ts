import { useQuery } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { useAuth } from "@/context/AuthContext.tsx";

export const useInvitations = () => {
    const { secureFetch } = useApi();
    const { token } = useAuth();

    return useQuery({
        queryKey: ["pending-invitations"],
        queryFn: async () => {
            const res = await secureFetch("/api/invites/pending");
            if (!res.ok) throw new Error("Failed to fetch invitations");
            return res.json();
        },
        enabled: !!token,
        refetchInterval: 30000,
    });
};