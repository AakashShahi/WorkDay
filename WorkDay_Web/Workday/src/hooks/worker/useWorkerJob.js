import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { acceptAssignedJobService, cancelRequestedJobService, deleteFailedJobSevice, getAssignedJobService, getCompletedJobService, getFailedJobService, getInProgressJobService, getPublicJobService, getRequestedJobService, rejectAssignedJobService, requestPublicJobService } from "../../services/worker/jobService";
import { WORKER_ASSIGNED_JOB, WORKER_COMPLETED_JOB, WORKER_FAILED_JOB, WORKER_IN_PROGRESS_JOB, WORKER_PUBLIC_JOB, WORKER_REQUESTED_JOB } from "../../constants/queryKeys";

export const useWorkerInProgressJob = () => {
    const query = useQuery(
        {
            queryKey: [WORKER_IN_PROGRESS_JOB],
            queryFn: () => getInProgressJobService()
        }
    )
    const inProgressJobs = query.data?.data || []
    return {
        ...query,
        inProgressJobs
    }
}

export const useWorkerPublicJob = (queryParams) => {
    const query = useQuery({
        queryKey: [WORKER_PUBLIC_JOB, queryParams],
        queryFn: () => getPublicJobService(queryParams),
        keepPreviousData: true,
    });

    return {
        ...query,
        publicJobs: query.data?.data || [],
        pagination: query.data?.pagination || { page: 1, totalPages: 1 },
    };
};

export const useRequestPublicJob = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (jobId) => requestPublicJobService(jobId),
        onSuccess: () => {
            toast.success("Job request sent!");
            queryClient.invalidateQueries({ queryKey: [WORKER_PUBLIC_JOB] });
        },
        onError: (error) => {
            toast.error(error?.message || "Failed to request job.");
        },
    });
};

export const useRequestedJob = () => {
    const query = useQuery(
        {
            queryKey: [WORKER_REQUESTED_JOB],
            queryFn: () => getRequestedJobService()
        }
    )
    const requestedJobs = query.data?.data || []
    return {
        ...query,
        requestedJobs
    }
}

export const useCancelRequestedJob = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (jobId) => cancelRequestedJobService(jobId),
        onSuccess: () => {
            toast.success("Request cancelled successfully!");
            queryClient.invalidateQueries({ queryKey: [WORKER_REQUESTED_JOB] });
            queryClient.invalidateQueries({ queryKey: [WORKER_PUBLIC_JOB] });
        },
        onError: (error) => {
            toast.error(error?.message || "Failed to cancel request.");
        },
    });
};

export const useWorkerAssignedJob = () => {
    const query = useQuery({
        queryKey: [WORKER_ASSIGNED_JOB],
        queryFn: () => getAssignedJobService(),
    });

    const assignedJobs = query.data?.data || [];
    return {
        ...query,
        assignedJobs,
    };
};

export const useAcceptAssignedJob = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (jobId) => acceptAssignedJobService(jobId),
        onSuccess: () => {
            toast.success("Job accepted!");
            queryClient.invalidateQueries({ queryKey: [WORKER_ASSIGNED_JOB] });
            queryClient.invalidateQueries({ queryKey: [WORKER_IN_PROGRESS_JOB] });
        },
        onError: (err) => {
            toast.error(err?.message || "Failed to accept job.");
        },
    });
};

export const useRejectAssignedJob = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (jobId) => rejectAssignedJobService(jobId),
        onSuccess: () => {
            toast.success("Job rejected.");
            queryClient.invalidateQueries({ queryKey: [WORKER_ASSIGNED_JOB] });
            queryClient.invalidateQueries({ queryKey: [WORKER_PUBLIC_JOB] });
        },
        onError: (err) => {
            toast.error(err?.message || "Failed to reject job.");
        },
    });
};

export const useWorkerCompletedJob = (params) => {
    const query = useQuery({
        queryKey: [WORKER_COMPLETED_JOB, params],
        queryFn: () => getCompletedJobService(params),
        keepPreviousData: true,
    });

    return {
        ...query,
        completedJobs: query.data?.data || [],
        pagination: query.data?.pagination || { page: 1, totalPages: 1 },
    };
};

export const useWorkerFailedJob = () => {
    const query = useQuery({
        queryKey: [WORKER_FAILED_JOB],
        queryFn: () => getFailedJobService(),
    });

    return {
        ...query,
        failedJobs: query.data?.data || []
    };
};

export const deleteFailedJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (jobId) => deleteFailedJobSevice(jobId),
        onSuccess: () => {
            toast.success("Failed job deleted.");
            queryClient.invalidateQueries({ queryKey: [WORKER_FAILED_JOB] });
        },
        onError: (err) => {
            toast.error(err?.message || "Failed to failed job.");
        },
    });

}
