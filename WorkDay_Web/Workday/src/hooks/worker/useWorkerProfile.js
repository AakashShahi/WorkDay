import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getWorkerProfileService,
    updateWorkerProfileService,
    updateWorkerPasswordService,
    applyForVerificationService,
    cancelVerificationService,
    initializePaymentService,
    verifyPaymentService
} from "../../services/worker/profileService";
import { WORKER_PROFILE, WORKER_CHANGE_PASSWORD, WORKER_UPDATE_PROFILE } from "../../constants/queryKeys"

//  Get Worker Profile
// ... existing hooks ...

// Initialize Payment hook
export const useInitializePayment = () => {
    return useMutation({
        mutationFn: (payload) => initializePaymentService(payload),
        onSuccess: (data) => {
            if (data.success && data.data.payment_url) {
                window.location.href = data.data.payment_url;
            }
        },
        onError: (error) => {
            toast.error(error.message || "Failed to initialize payment");
        },
    });
};

// Verify Payment hook
export const useVerifyPayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (pidx) => verifyPaymentService(pidx),
        onSuccess: (data) => {
            if (data.data.status === "Completed") {
                toast.success("Payment successful! Verification request submitted.");
                queryClient.invalidateQueries([WORKER_PROFILE]);
            } else {
                toast.warning(`Payment status: ${data.data.status}`);
            }
        },
        onError: (error) => {
            toast.error(error.message || "Failed to verify payment");
        },
    });
};
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


