import axios from "../api"

export const getInProgressJobApi = () => axios.get("/worker/jobs/in-progress")

export const getPublicJobApi = (params) =>
    axios.get("/worker/jobs/public", { params });

export const requestPublicJobApi = (jobId) =>
    axios.post(`/worker/jobs/public/${jobId}/accept`);

export const getRequestedJobApi = () => axios.get("/worker/jobs/requested")

export const cancelRequestedJobApi = (jobId) =>
    axios.patch(`/worker/jobs/requested/cancel/${jobId}`);

export const getAssignedJobApi = () => axios.get("/worker/jobs/assigned")

export const acceptAssignedJobApi = (jobId) => axios.put(`worker/jobs/assigned/${jobId}/accept`)

export const rejectAssignedJobApi = (jobId) => axios.put(`worker/jobs/assigned/${jobId}/reject`)

export const getCompletedJobApi = (params) =>
    axios.get("/worker/jobs/completed", { params });

export const getFailedJobApi = () => axios.get("/worker/jobs/failed")

export const deleteFailedJobByWorkerApi = (jobId) => axios.delete(`/worker/jobs/${jobId}/soft-delete`)


// Worker job related API endpoints
