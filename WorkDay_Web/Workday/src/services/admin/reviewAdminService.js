import { deleteReviewApi, getAllReviewApi } from "../../api/admin/reviewApi"

export const getAllReviewService = async (params) => {
    try {
        const response = await getAllReviewApi(params)
        return response.data
    } catch (err) {
        throw err.response?.data || { message: 'Failed to fetch' }
    }
}

export const deleteReviewService = async (reviewId) => {
    try {
        const response = await deleteReviewApi(reviewId)
        return response.data
    } catch (err) {
        throw err.response?.data || { message: 'Failed to fetch' }
    }
}