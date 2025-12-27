import axios from "../api"

export const getAllReviewApi = (params) => axios.get("/admin/review", { params })
export const deleteReviewApi = (reviewId) => axios.delete(`/admin/review/delete/${reviewId}`)