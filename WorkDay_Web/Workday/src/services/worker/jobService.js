import {
    getInProgressJobApi, getPublicJobApi, requestPublicJobApi, getRequestedJobApi, cancelRequestedJobApi,
    getAssignedJobApi, acceptAssignedJobApi, rejectAssignedJobApi,
    getCompletedJobApi, getFailedJobApi, deleteFailedJobByWorkerApi
} from "../../api/worker/jobApi"

export const getInProgressJobService = async () => {
    try {
        const response = await getInProgressJobApi()
        return response.data
    } catch (err) {
        console.log(err);
        throw err.response?.data || { message: 'Failed to fetch' }
    }
}

export const getPublicJobService = async (queryParams) => {
    try {
        const response = await getPublicJobApi(queryParams);
        return response.data;
    } catch (err) {
        console.log(err);
        throw err.response?.data || { message: "Failed to fetch public jobs" };
    }
};

export const requestPublicJobService = async (jobId) => {
    try {
        const res = await requestPublicJobApi(jobId);
        return res.data;
    } catch (error) {
        throw err.response?.data || { message: "Failed to request public jobs" };
    }

};

export const getRequestedJobService = async () => {
    try {
        const response = await getRequestedJobApi()
        return response.data
    } catch (err) {
        console.log(err);
        throw err.response?.data || { message: 'Failed to fetch' }
    }
}

export const cancelRequestedJobService = async (jobId) => {
    try {
        const response = await cancelRequestedJobApi(jobId);
        return response.data;
    } catch (err) {
        console.log(err);
        throw err.response?.data || { message: "Failed to cancel requested job" };
    }
};

export const getAssignedJobService = async () => {
    try {
        const response = await getAssignedJobApi();
        return response.data;
    } catch (err) {
        console.log(err);
        throw err.response?.data || { message: "Failed to fetch assigned jobs" };
    }
};

export const acceptAssignedJobService = async (jobId) => {
    try {
        const response = await acceptAssignedJobApi(jobId);
        return response.data;
    } catch (err) {
        console.log(err);
        throw err.response?.data || { message: "Failed to accept job" };
    }
};

export const rejectAssignedJobService = async (jobId) => {
    try {
        const response = await rejectAssignedJobApi(jobId);
        return response.data;
    } catch (err) {
        console.log(err);
        throw err.response?.data || { message: "Failed to reject job" };
    }
};

export const getCompletedJobService = async (params) => {
    try {
        const response = await getCompletedJobApi(params);
        return response.data;
    } catch (err) {
        console.log(err);
        throw err.response?.data || { message: "Failed to fetch completed jobs" };
    }
};

export const getFailedJobService = async () => {
    try {
        const response = await getFailedJobApi();
        return response.data;
    } catch (err) {
        console.log(err);
        throw err.response?.data || { message: "Failed to fetch completed jobs" };
    }
};

export const deleteFailedJobSevice = async (jobId) => {
    try {
        const response = await deleteFailedJobByWorkerApi(jobId)
        return response.data
    } catch (error) {
        console.log(err);
        throw err.response?.data || { message: "Failed to delete failed jobs" };
    }
}