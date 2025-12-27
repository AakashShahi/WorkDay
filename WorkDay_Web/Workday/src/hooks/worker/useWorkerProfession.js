import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWorkerProfessionService } from "../../services/worker/workerProfessionService";
import { WORKER_PROFESSION } from "../../constants/queryKeys";

export const useWorkerProfession = () => {
    const query = useQuery(
        {
            queryKey: [WORKER_PROFESSION],
            queryFn: () => getWorkerProfessionService()
        }
    )
    const professions = query.data?.data || []
    return {
        ...query,
        professions
    }
}