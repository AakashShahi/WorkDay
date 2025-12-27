import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getWorkerProfileService,
    updateWorkerProfileService,
    updateWorkerPasswordService,
    applyForVerificationService,
    cancelVerificationService,
} from "../../services/worker/profileService";
import { WORKER_PROFILE, WORKER_CHANGE_PASSWORD, WORKER_UPDATE_PROFILE } from "../../constants/queryKeys"

//  Get Worker Profile
export const useGetWorkerProfile = () => {
    return useQuery({
        queryKey: [WORKER_PROFILE],
        queryFn: getWorkerProfileService,
    });
};

//  Update Worker Profile
export const useUpdateWorkerProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload) => updateWorkerProfileService(payload),
        mutationKey: [WORKER_UPDATE_PROFILE],
        onSuccess: () => {
            toast.success("Profile updated successfully");
            queryClient.invalidateQueries([WORKER_PROFILE]);
        },
    });
};

//  Change Worker Password
export const useUpdateWorkerPassword = () => {
    return useMutation({
        mutationFn: (payload) => updateWorkerPasswordService(payload),
        mutationKey: [WORKER_CHANGE_PASSWORD],
        onSuccess: () => {
            toast.success("Password updated successfully");
        },
    });
};

// Apply for verification mutation hook
export const useApplyForVerification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: applyForVerificationService,
        onSuccess: (data) => {
            toast.success(data.message || "Verification request sent");
            queryClient.invalidateQueries(WORKER_PROFILE);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to apply for verification");
        },
    });
};

// Cancel verification mutation hook
export const useCancelVerification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cancelVerificationService,
        onSuccess: (data) => {
            toast.success(data.message || "Verification request cancelled");
            queryClient.invalidateQueries(WORKER_PROFILE);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to cancel verification request");
        },
    });
};


