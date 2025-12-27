import { saveMessageApi, getChatHistoryApi } from "../../api/chatApi";

export const saveMessageService = async (payload) => {
    try {
        const response = await saveMessageApi(payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to send message" };
    }
};

export const getChatHistoryService = async (jobId) => {
    try {
        const response = await getChatHistoryApi(jobId);
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            return {
                chat: {
                    messages: [],
                    participants: [],
                },
            };
        }

        throw error.response?.data || { message: "Failed to fetch chat history" };
    }
};