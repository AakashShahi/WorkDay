import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteReviewService, getAllReviewService } from "../../services/admin/reviewAdminService";
import { toast } from "react-toastify";
import { ADMIN_REVIEW_LIST } from "../../constants/queryKeys";


export const useGetAllReviews = (params) => {
    const query = useQuery({
        queryKey: [ADMIN_REVIEW_LIST, params],
        queryFn: () => getAllReviewService(params),
        keepPreviousData: true,
    });

    return {
        ...query,
        reviews: query.data?.data || [],
        pagination: query.data?.pagination || { page: 1, totalPages: 1 },
        search: params.search || "",
    };
};

export const useDeleteReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reviewId) => deleteReviewService(reviewId),
        onSuccess: (data) => {
            toast.success(data.message || "Review deleted successfully");
            queryClient.invalidateQueries([ADMIN_REVIEW_LIST]);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete review");
        },
    });
};