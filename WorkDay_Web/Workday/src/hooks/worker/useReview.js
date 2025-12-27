import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
    getReviewsService,
    deleteReviewSevice
} from "../../services/worker/reviewService";

import { WORKER_REVIEW } from "../../constants/queryKeys";

export const useWorkerReviews = (params) => {
    const query = useQuery({
        queryKey: [WORKER_REVIEW, params],
        queryFn: () => getReviewsService(params),
        keepPreviousData: true,
    });

    return {
        ...query,
        reviews: query.data?.data || [],
        pagination: query.data?.pagination || { page: 1, totalPages: 1 },
    };
};

// 🗑️ Delete a worker review
export const useDeleteWorkerReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reviewId) => deleteReviewSevice(reviewId),
        onSuccess: () => {
            toast.success("Review deleted successfully.");
            queryClient.invalidateQueries({ queryKey: [WORKER_REVIEW] });
        },
        onError: (error) => {
            toast.error(error?.message || "Failed to delete review.");
        }
    });
};
