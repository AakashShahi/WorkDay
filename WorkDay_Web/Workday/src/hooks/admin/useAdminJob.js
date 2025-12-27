import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getAllJobsService, deleteJobService, deleteAllJobsService } from "../../services/admin/adminJobService";

// Custom hook for managing admin jobs
// It provides functionalities to fetch all jobs, delete a specific job, and delete all jobs

export const useAdminJob = () => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['adminJobs'],
        queryFn: getAllJobsService,
        onError: (error) => {
            toast.error(error.message || "Failed to fetch jobs");
        }
    });

    const jobs = query.data?.data || [];

    return {
        ...query,
        jobs
    };
}

export const useDeleteJob = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['adminJobDelete'],
        mutationFn: (id) => deleteJobService(id),
        onSuccess: (data) => {
            toast.success(data.message || "Job deleted successfully");
            queryClient.invalidateQueries(['adminJobs']);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete job");
        }
    });
}

export const useDeleteAllJobs = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['adminJobDeleteAll'],
        mutationFn: deleteAllJobsService,
        onSuccess: (data) => {
            toast.success(data.message || "All jobs deleted successfully");
            queryClient.invalidateQueries(['adminJobs']);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete all jobs");
        }
    });
}


