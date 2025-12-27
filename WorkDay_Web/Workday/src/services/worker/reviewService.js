import { getReviewsApi, deleteReviewApi } from "../../api/worker/reviewApi";

export const getReviewsService = async (params) => {
    try {
        const response = await getReviewsApi(params)
        return response.data
    } catch (err) {
        console.log(err);
        throw err.response?.data || { message: 'Failed to fetch' }
    }
}

export const deleteReviewSevice = async (reviewId) => {
    try {
        const response = await deleteReviewApi(reviewId)
        return response.data
    } catch (error) {
        console.log(err);
        throw err.response?.data || { message: "Failed to delete reviews" };
    }
}