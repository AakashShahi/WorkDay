import axios from "../api"

export const getReviewsApi = (params) => axios.get("/worker/reviews", { params })

export const deleteReviewApi = (reviewId) => axios.delete(`/worker/reviews/delete/${reviewId}`)