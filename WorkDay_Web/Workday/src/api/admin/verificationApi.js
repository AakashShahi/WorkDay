import axios from "../api";

export const getVerificationRequestsApi = (params) =>
    axios.get("/admin/verification/worker", { params });

export const acceptVerificationApi = (workerId) =>
    axios.post(`/admin/verification/worker/accept/${workerId}`);

export const rejectVerificationApi = (workerId) =>
    axios.post(`/admin/verification/worker/reject/${workerId}`);