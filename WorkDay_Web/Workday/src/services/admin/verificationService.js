import { acceptVerificationApi, getVerificationRequestsApi, rejectVerificationApi } from "../../api/admin/verificationApi";

export const getVerificationRequestsService = async (params) => {
    try {
        const res = await getVerificationRequestsApi(params);
        return res.data;
    } catch (error) {
        console.error("Failed to fetch verification requests:", error);
        throw new Error(
            error?.response?.data?.message || "Unable to fetch verification requests"
        );
    }
};

// Accept a worker's verification
export const acceptVerificationService = async (workerId) => {
    try {
        const res = await acceptVerificationApi(workerId);
        return res.data;
    } catch (error) {
        console.error("Failed to accept verification:", error);
        throw new Error(
            error?.response?.data?.message || "Failed to accept verification"
        );
    }
};

// Reject a worker's verification
export const rejectVerificationService = async (workerId) => {
    try {
        const res = await rejectVerificationApi(workerId);
        return res.data;
    } catch (error) {
        console.error("Failed to reject verification:", error);
        throw new Error(
            error?.response?.data?.message || "Failed to reject verification"
        );
    }
};