import { getAllJobApi, deleteAllJobApi, deleteJobApi } from "../../api/admin/adminJobApi";

//Service functions for admin job management
export const getAllJobsService = async () => {
    try {
        const res = await getAllJobApi();
        return res.data;
    } catch (err) {
        throw err.response?.data || { message: "Failed to fetch jobs" };
    }
}

export const deleteJobService = async (id) => {
    try {
        const res = await deleteJobApi(id);
        return res.data;
    } catch (err) {
        throw err.response?.data || { message: "Failed to delete job" };
    }
}

export const deleteAllJobsService = async () => {
    try {
        const res = await deleteAllJobApi();
        return res.data;
    } catch (err) {
        throw err.response?.data || { message: "Failed to delete all jobs" };
    }
}

