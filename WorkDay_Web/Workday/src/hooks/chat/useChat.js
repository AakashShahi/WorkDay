import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChatHistoryService, saveMessageService } from "../../services/chat/chatService";
import { toast } from "react-toastify";

export const useGetChatHistory = (jobId) => {
    const query = useQuery({
        queryKey: ["chat-history", jobId],
        queryFn: () => getChatHistoryService(jobId),
        enabled: !!jobId,
    });

    return {
        ...query,
        messages: query.data?.chat?.messages || [],
    };
};

export const useSendMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload) => saveMessageService(payload),
        onSuccess: (data) => {
            // FIX: Invalidate the chat history query after a successful message send.
            // This will tell react-query to refetch the latest chat history,
            // which will include the message the worker just sent.
            queryClient.invalidateQueries(["chat-history", data.chat.jobId]); // Use data.chat.jobId for the correct key
            // You can also optimistically update the cache here if you want to be super fast,
            // but invalidation and refetch is simpler and often sufficient.
        },
        onError: (error) => {
            toast.error(error.message || "Failed to send message");
        },
    });
};