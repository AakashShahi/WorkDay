import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchAuditLogs = async (params) => {
    const token = localStorage.getItem("token");
    const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/profile/audit-logs`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
    });
    return data;
};

export const useAuditLogs = (params) => {
    return useQuery({
        queryKey: ["auditLogs", params],
        queryFn: () => fetchAuditLogs(params),
        keepPreviousData: true
    });
};
