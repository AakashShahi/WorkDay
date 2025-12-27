import { getWorkerProfessionApi } from "../../api/worker/workerProfessionApi";

export const getWorkerProfessionService = async () => {
    try {
        const response = await getWorkerProfessionApi();
        return response.data;
    } catch (err) {
        console.error("Error fetching worker profession:", err);
        throw err.response?.data || { message: "Failed to fetch worker profession" };
    }
};

