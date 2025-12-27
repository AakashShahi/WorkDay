// src/hooks/admin/useAdminVerification.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getVerificationRequestsService,
    acceptVerificationService,
    rejectVerificationService,
} from "../../services/admin/verificationService";
import { toast } from "react-toastify";
import { ADMIN_VERIFICATION_LIST } from "../../constants/queryKeys";


export const useGetVerificationRequests = (params) => {
    const query = useQuery({
        queryKey: [ADMIN_VERIFICATION_LIST, params],
        queryFn: () => getVerificationRequestsService(params),
        keepPreviousData: true,
    });

    return {
        ...query,
        verifications: query.data?.data || [],
        pagination: query.data?.pagination || { page: 1, totalPages: 1 },
    };

}

export const useAcceptVerification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (workerId) => acceptVerificationService(workerId),
        onSuccess: (data) => {
            toast.success(data.message || "Verification accepted");
            queryClient.invalidateQueries([ADMIN_VERIFICATION_LIST]);
        },
        onError: (err) => {
            toast.error(err.message || "Failed to accept");
        },
    });
};


export const useRejectVerification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (workerId) => rejectVerificationService(workerId),
        onSuccess: (data) => {
            toast.success(data.message || "Verification rejected");
            queryClient.invalidateQueries([ADMIN_VERIFICATION_LIST]);
        },
        onError: (err) => {
            toast.error(err.message || "Failed to reject");
        },
    });
};
