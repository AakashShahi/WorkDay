import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAdminProfileService,
    updateAdminProfileService,
    changeAdminPasswordService,
} from "../../services/admin/adminProfileService";
import { toast } from "react-toastify";

export const useAdminProfile = () => {
    const query = useQuery({
        queryKey: ["admin-profile"],
        queryFn: getAdminProfileService,
    });

    return {
        ...query,
        admin: query.data?.data || null,
    };
};

export const useUpdateAdminProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData) => updateAdminProfileService(formData),
        onSuccess: (data) => {
            toast.success(data.message || "Profile updated successfully");
            queryClient.invalidateQueries(["admin-profile"]);
        },
        onError: (err) => {
            toast.error(err.message || "Failed to update profile");
        },
    });
};

export const useChangeAdminPassword = () => {
    return useMutation({
        mutationFn: (payload) => changeAdminPasswordService(payload),
        onSuccess: (data) => {
            toast.success(data.message || "Password updated successfully");
        },
        onError: (err) => {
            toast.error(err.message || "Failed to update password");
        },
    });
};
